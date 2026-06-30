from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models
from app.schemas import schemas
from app.core.date_utils import get_wib_now

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("", response_model=List[schemas.OrderResponse])
def list_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        orders = db.query(models.Order).all()
    elif current_user.role == "driver":
        orders = db.query(models.Order).filter(
            (models.Order.status == "PAID") | 
            ((models.Order.status == "SHIPPING") & (models.Order.driver_id == current_user.id))
        ).all()
    elif current_user.role == "seller":
        # Get orders that contain products from this seller's store
        store_id = current_user.store.id if current_user.store else None
        if not store_id:
            return []
        orders = db.query(models.Order).join(models.OrderItem).join(models.Product).filter(
            models.Product.store_id == store_id
        ).all()
    else:  # buyer
        orders = db.query(models.Order).filter(models.Order.buyer_id == current_user.id).all()
        
    # Inject reviewedProductIds for frontend compat
    for o in orders:
        o.reviewedProductIds = [r.product_id for r in o.reviews]
        o.buyerName = o.buyer.name if o.buyer else "Pembeli"
        o.driverName = o.driver.name if o.driver else None
        
    return sorted(orders, key=lambda x: x.created_at, reverse=True)

@router.post("/checkout")
def checkout(
    payload: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.buyer_user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Get address
    addr = db.query(models.Address).filter(
        models.Address.id == payload.addressId,
        models.Address.user_id == current_user.id
    ).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")

    # Calculate subtotal & validate stock
    subtotal = 0
    order_items = []
    for item in cart.items:
        if item.product.stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock for product {item.product.name}"
            )
        subtotal += item.product.price * item.quantity
        order_items.append((item.product, item.quantity, item.product.price))

    # Apply discounts
    discount = 0
    if payload.voucherCode:
        v = db.query(models.Voucher).filter(
            models.Voucher.code == payload.voucherCode,
            models.Voucher.active == 1,
            models.Voucher.expiry_date > get_wib_now()
        ).first()
        if v and subtotal >= v.min_purchase:
            if v.discount_type == models.DiscountTypeEnum.percent:
                discount = min(v.max_discount, (subtotal * v.value) // 100)
            else:
                discount = v.value
            v.usage_count += 1
            
    total = subtotal - discount

    # Create Order
    order_id = f"ORD-{random.randint(1000, 9999)}"
    now = get_wib_now()
    deadline = now + timedelta(hours=2) # 2 hours payment deadline
    
    order = models.Order(
        id=order_id,
        buyer_id=current_user.id,
        subtotal=subtotal,
        discount=discount,
        total=total,
        address=addr.detail,
        status="UNPAID",
        created_at=now,
        payment_deadline=deadline
    )
    db.add(order)
    db.flush()

    # Deduct stock and create order items, clear cart
    for prod, qty, price in order_items:
        prod.stock -= qty
        db.add(models.OrderItem(order_id=order_id, product_id=prod.id, quantity=qty, price=price))
        
    # Clear cart items
    for item in list(cart.items):
        db.delete(item)

    db.commit()
    return {"orderId": order_id, "message": "Order created successfully. Please pay before deadline."}

@router.post("/{order_id}/pay")
def pay_order(
    order_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.buyer_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.status != "UNPAID":
        raise HTTPException(status_code=400, detail="Order is already paid or cancelled")

    # Check deadline
    if get_wib_now() >= order.payment_deadline:
        order.status = "CANCELLED"
        order.cancellation_reason = "Batas waktu pembayaran habis (Overdue)"
        db.commit()
        raise HTTPException(status_code=400, detail="Payment deadline has passed. Order cancelled.")

    # Deduct wallet
    wallet = current_user.wallet
    if not wallet or wallet.balance < order.total:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
    wallet.balance -= order.total
    db.add(models.WalletTransaction(
        wallet_id=wallet.id,
        type="PAYMENT",
        amount=-order.total,
        timestamp=get_wib_now(),
        description=f"Pembayaran Pesanan {order_id}"
    ))

    # Pay stores
    order.status = "PAID"
    
    # Restribute funds to sellers (mocked directly for simplicity or store ledger)
    for item in order.items:
        seller_user = item.product.store.owner
        if seller_user and seller_user.wallet:
            seller_user.wallet.balance += item.price * item.quantity
            db.add(models.WalletTransaction(
                wallet_id=seller_user.wallet.id,
                type="EARNING",
                amount=item.price * item.quantity,
                timestamp=get_wib_now(),
                description=f"Hasil Penjualan Pesanan {order_id} - {item.product.name}"
            ))

    db.commit()
    return {"message": "Order paid successfully"}

@router.post("/{order_id}/cancel")
def cancel_order_api(
    order_id: str,
    reason: str = "Dibatalkan oleh pembeli",
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.status not in ["UNPAID", "PAID"]:
        raise HTTPException(status_code=400, detail="Cannot cancel order in this status")
        
    if current_user.role != "admin" and order.buyer_id != current_user.id and current_user.storeId not in order.storeIds:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Restore stock
    for item in order.items:
        item.product.stock += item.quantity

    # Refund if already paid
    if order.status == "PAID":
        buyer_wallet = order.buyer.wallet
        if buyer_wallet:
            buyer_wallet.balance += order.total
            db.add(models.WalletTransaction(
                wallet_id=buyer_wallet.id,
                type="REFUND",
                amount=order.total,
                timestamp=get_wib_now(),
                description=f"Refund Pembatalan Pesanan {order_id}"
            ))
            
        # Deduct store owners
        for item in order.items:
            seller_user = item.product.store.owner
            if seller_user and seller_user.wallet:
                seller_user.wallet.balance -= item.price * item.quantity
                db.add(models.WalletTransaction(
                    wallet_id=seller_user.wallet.id,
                    type="REFUND_DEDUCTION",
                    amount=-item.price * item.quantity,
                    timestamp=get_wib_now(),
                    description=f"Refund Pemotongan Pembatalan Pesanan {order_id}"
                ))

    order.status = "CANCELLED"
    order.cancellation_reason = reason
    db.commit()
    return {"message": "Order cancelled successfully"}

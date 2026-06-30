from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/delivery", tags=["delivery"])

@router.post("/{order_id}/accept")
def accept_delivery(
    order_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if "driver" not in [r.role for r in current_user.roles] and current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can accept deliveries")

    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.status == "PAID"
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not eligible for delivery")
        
    order.status = "SHIPPING"
    order.driver_id = current_user.id
    db.commit()
    return {"message": "Delivery accepted"}

@router.post("/{order_id}/complete")
def complete_delivery(
    order_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.status == "SHIPPING"
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not in shipping status")
        
    if current_user.role != "admin" and order.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    order.status = "DELIVERED"
    
    # Reward driver with Rp 10.000 fee
    driver = order.driver
    if driver and driver.wallet:
        driver.wallet.balance += 10000
        db.add(models.WalletTransaction(
            wallet_id=driver.wallet.id,
            type="EARNING",
            amount=10000,
            timestamp=datetime.utcnow(),
            description=f"Fee Pengantaran Pesanan {order_id}"
        ))

    db.commit()
    return {"message": "Delivery completed successfully"}

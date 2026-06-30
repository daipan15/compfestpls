from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import models

router = APIRouter(prefix="/clock", tags=["clock"])

# Global simulation hours offset
SIM_HOURS_OFFSET = 0

def get_sim_time() -> datetime:
    global SIM_HOURS_OFFSET
    return datetime.utcnow() + timedelta(hours=SIM_HOURS_OFFSET)

@router.get("")
def get_current_sim_time():
    return {"simTime": get_sim_time().isoformat()}

@router.post("/advance")
def advance_sim_time(hours: int, db: Session = Depends(get_db)):
    global SIM_HOURS_OFFSET
    SIM_HOURS_OFFSET += hours
    sim_time = get_sim_time()
    
    # 1. Check Unpaid orders for Overdue cancellation
    unpaid_orders = db.query(models.Order).filter(models.Order.status == "UNPAID").all()
    overdue_count = 0
    for order in unpaid_orders:
        if sim_time >= order.payment_deadline:
            order.status = "CANCELLED"
            order.cancellation_reason = "Batas waktu pembayaran habis (Overdue)"
            overdue_count += 1
            # Restore stock
            for item in order.items:
                item.product.stock += item.quantity

    # 2. Check Paid orders for delivery starting (PAID -> SHIPPING after 1 hr)
    paid_orders = db.query(models.Order).filter(models.Order.status == "PAID").all()
    shipping_count = 0
    for order in paid_orders:
        elapsed = (sim_time - order.created_at).total_seconds() / 3600.0
        if elapsed >= 1.0:
            order.status = "SHIPPING"
            # Assign driver1 (id 4)
            order.driver_id = 4
            shipping_count += 1

    # 3. Check Shipping orders for delivery completion (SHIPPING -> DELIVERED after 2 hr)
    shipping_orders = db.query(models.Order).filter(models.Order.status == "SHIPPING").all()
    delivered_count = 0
    for order in shipping_orders:
        elapsed = (sim_time - order.created_at).total_seconds() / 3600.0
        if elapsed >= 3.0: # 1 hr (to ship) + 2 hr (shipping) = 3 hr total
            order.status = "DELIVERED"
            delivered_count += 1
            # Reward driver
            driver = order.driver
            if driver and driver.wallet:
                driver.wallet.balance += 10000
                db.add(models.WalletTransaction(
                    wallet_id=driver.wallet.id,
                    type="EARNING",
                    amount=10000,
                    timestamp=sim_time,
                    description=f"Fee Pengantaran Pesanan {order.id}"
                ))

    db.commit()
    return {
        "simTime": sim_time.isoformat(), 
        "message": f"Waktu simulasi berhasil dimajukan {hours} jam.",
        "updates": {
            "overdue_cancelled": overdue_count,
            "delivery_started": shipping_count,
            "delivery_completed": delivered_count
        }
    }

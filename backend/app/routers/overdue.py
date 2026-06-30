from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.routers.clock import get_sim_time
from app.models import models

router = APIRouter(prefix="/overdue", tags=["overdue"])

@router.post("/check")
def check_overdue_orders(db: Session = Depends(get_db)):
    sim_time = get_sim_time()
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
                
    db.commit()
    return {
        "checked_at": sim_time.isoformat(),
        "cancelled_count": overdue_count
    }

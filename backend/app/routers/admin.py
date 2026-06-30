from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/analytics")
def get_analytics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    orders = db.query(models.Order).filter(models.Order.status != "CANCELLED").all()
    
    total_sales = sum(o.total for o in orders if o.status != "UNPAID")
    total_transactions = len(orders)
    pending_orders = sum(1 for o in orders if o.status in ["PAID", "SHIPPING"])
    
    # Store-specific breakdowns (e.g. sales by store)
    stores = db.query(models.Store).all()
    stores_breakdown = []
    for s in stores:
        s_orders = db.query(models.Order).join(models.OrderItem).join(models.Product).filter(
            models.Product.store_id == s.id,
            models.Order.status != "CANCELLED",
            models.Order.status != "UNPAID"
        ).all()
        s_revenue = sum(item.price * item.quantity for o in s_orders for item in o.items if item.product.store_id == s.id)
        stores_breakdown.append({
            "store_id": s.id,
            "name": s.name,
            "revenue": s_revenue,
            "orders_count": len(s_orders)
        })
        
    return {
        "total_sales": total_sales,
        "total_transactions": total_transactions,
        "pending_orders": pending_orders,
        "stores_breakdown": stores_breakdown
    }

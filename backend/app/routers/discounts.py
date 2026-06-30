from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/discounts", tags=["discounts"])

@router.get("/vouchers/{code}", response_model=schemas.VoucherResponse)
def get_voucher(code: str, db: Session = Depends(get_db)):
    v = db.query(models.Voucher).filter(
        models.Voucher.code == code,
        models.Voucher.active == 1,
        models.Voucher.expiry_date > datetime.utcnow()
    ).first()
    
    if not v:
        raise HTTPException(status_code=404, detail="Voucher not found or expired")
        
    if v.usage_limit > 0 and v.usage_count >= v.usage_limit:
        raise HTTPException(status_code=400, detail="Voucher usage limit reached")
        
    return v

@router.get("/promos/{code}", response_model=schemas.PromoResponse)
def get_promo(code: str, db: Session = Depends(get_db)):
    p = db.query(models.Promo).filter(
        models.Promo.code == code,
        models.Promo.expiry_date > datetime.utcnow()
    ).first()
    
    if not p:
        raise HTTPException(status_code=404, detail="Promo not found or expired")
        
    return p

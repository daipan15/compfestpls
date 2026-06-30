from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/addresses", tags=["addresses"])

@router.get("", response_model=List[schemas.AddressResponse])
def list_addresses(
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return db.query(models.Address).filter(models.Address.user_id == current_user.id).all()

@router.post("", response_model=schemas.AddressResponse)
def create_address(
    payload: schemas.AddressCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_addr = models.Address(
        user_id=current_user.id,
        title=payload.title,
        detail=payload.detail
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return new_addr

@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    addr = db.query(models.Address).filter(
        models.Address.id == address_id, 
        models.Address.user_id == current_user.id
    ).first()
    
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
        
    db.delete(addr)
    db.commit()
    return {"message": "Address deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/stores", tags=["stores"])

@router.get("", response_model=List[schemas.StoreResponse])
def list_stores(db: Session = Depends(get_db)):
    return db.query(models.Store).all()

@router.get("/{store_id}", response_model=schemas.StoreResponse)
def get_store(store_id: str, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

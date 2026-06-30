from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[schemas.ProductResponse])
def list_products(
    q: Optional[str] = None,
    store_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    
    if store_id:
        query = query.filter(models.Product.store_id == store_id)
        
    if q:
        query = query.filter(
            (models.Product.name.ilike(f"%{q}%")) | 
            (models.Product.description.ilike(f"%{q}%"))
        )
        
    products = query.all()
    
    return products

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@router.post("", response_model=schemas.ProductResponse)
def create_product(
    payload: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.store:
        raise HTTPException(status_code=403, detail="Only sellers can sell products")
        
    new_product = models.Product(
        store_id=current_user.store.id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
        stock=payload.stock,
        image_url=payload.image_url or ""
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    payload: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if current_user.role != "admin" and p.store_id != current_user.storeId:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    p.name = payload.name
    p.description = payload.description
    p.price = payload.price
    p.stock = payload.stock
    p.image_url = payload.image_url or ""
    
    db.commit()
    db.refresh(p)
    return p

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if current_user.role != "admin" and p.store_id != current_user.storeId:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    db.delete(p)
    db.commit()
    return {"message": "Product deleted successfully"}

# Add Reviews for a Product
@router.post("/{product_id}/reviews/{order_id}")
def create_review(
    product_id: int,
    order_id: str,
    payload: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id, 
        models.Order.buyer_id == current_user.id,
        models.Order.status == "DELIVERED"
    ).first()
    
    if not order:
        raise HTTPException(status_code=400, detail="Invalid order or order is not delivered yet")
        
    # Check if review already exists
    existing = db.query(models.Review).filter(
        models.Review.order_id == order_id,
        models.Review.product_id == product_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted for this item")
        
    new_review = models.Review(
        order_id=order_id,
        product_id=product_id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(new_review)
    db.commit()
    return {"message": "Review submitted successfully"}

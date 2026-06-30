from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("", response_model=schemas.CartResponse)
def get_cart(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.buyer_user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(buyer_user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@router.post("/items")
def add_cart_item(
    payload: schemas.CartItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.buyer_user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(buyer_user_id=current_user.id)
        db.add(cart)
        db.flush()

    # Verify product and stock
    p = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if p.stock < payload.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    # Add or update
    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == payload.product_id
    ).first()
    
    if item:
        item.quantity = min(p.stock, item.quantity + payload.quantity)
    else:
        item = models.CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(item)
        
    db.commit()
    return {"message": "Product added to cart"}

@router.put("/items/{product_id}")
def update_cart_item_quantity(
    product_id: str,
    quantity: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.buyer_user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    if p.stock < quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")
        
    item.quantity = max(1, quantity)
    db.commit()
    return {"message": "Quantity updated"}

@router.delete("/items/{product_id}")
def remove_cart_item(
    product_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.buyer_user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
        
    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}

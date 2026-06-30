from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/wallet", tags=["wallet"])

@router.get("", response_model=schemas.WalletResponse)
def get_wallet(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = models.Wallet(user_id=current_user.id, balance=0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        
    # Sort transactions descending by timestamp
    txs = sorted(wallet.transactions, key=lambda x: x.timestamp, reverse=True)
    
    return {
        "balance": wallet.balance,
        "transactions": txs
    }

@router.post("/topup", response_model=schemas.WalletResponse)
def top_up_wallet(
    payload: schemas.WalletTopUp,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = models.Wallet(user_id=current_user.id, balance=0)
        db.add(wallet)
        db.flush()
        
    wallet.balance += payload.amount
    
    # Record transaction
    tx = models.WalletTransaction(
        wallet_id=wallet.id,
        type="TOPUP",
        amount=payload.amount,
        timestamp=datetime.utcnow(),
        description="Isi Saldo Dompet (Top Up)"
    )
    db.add(tx)
    db.commit()
    db.refresh(wallet)
    
    return {
        "balance": wallet.balance,
        "transactions": sorted(wallet.transactions, key=lambda x: x.timestamp, reverse=True)
    }

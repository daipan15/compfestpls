"""
Run with: python -m app.seed
Creates demo accounts for Admin, Seller, Buyer, Driver, plus sample products,
a voucher, and a promo so the system can be demoed end-to-end immediately.
"""
import datetime as dt

from app.core.database import SessionLocal, Base, engine
from app.models import models
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)


def get_or_create_user(db, username, email, password, roles, name=None):
    user = db.query(models.User).filter(models.User.username == username).first()
    if user:
        return user
    if not name:
        name = username.capitalize()
    user = models.User(username=username, email=email, password_hash=hash_password(password), name=name)
    db.add(user)
    db.flush()
    for r in roles:
        db.add(models.UserRoleAssignment(user_id=user.id, role=r))
    db.add(models.Wallet(user_id=user.id, balance=1_000_000 if "buyer" in roles else 0))
    db.add(models.Cart(buyer_user_id=user.id))
    db.commit()
    return user


def main():
    db = SessionLocal()
    
    # Create demo accounts
    admin = get_or_create_user(db, "admin", "admin@demo.com", "Admin123!", ["admin"], name="Admin System")
    seller = get_or_create_user(db, "seller1", "seller1@demo.com", "Seller123!", ["seller"], name="Seller Demo")
    buyer = get_or_create_user(db, "buyer1", "buyer1@demo.com", "Buyer123!", ["buyer"], name="Buyer Demo")
    driver = get_or_create_user(db, "driver1", "driver1@demo.com", "Driver123!", ["driver"], name="Kurir / Driver")
    multiuser = get_or_create_user(db, "multiuser", "multiuser@demo.com", "Multi123!", ["buyer", "seller"], name="Multi-Role User")

    # Create store for seller1
    store = db.query(models.Store).filter(models.Store.name == "Seapedia Electro").first()
    if not store:
        store = models.Store(user_id=seller.id, name="Seapedia Electro", description="Toko Elektronik Terbaik")
        db.add(store)
        db.flush()

    # Create products for store
    if db.query(models.Product).filter(models.Product.store_id == store.id).count() == 0:
        db.add_all([
            models.Product(store_id=store.id, name="Charger Gan 65W Rapid", description="Kepala charger fast charging hemat energi",
                            price=120000, stock=30, image_url=""),
            models.Product(store_id=store.id, name="Kabel USB-C", description="Kabel data cepat dan tahan lama",
                            price=35000, stock=100, image_url=""),
        ])
        db.commit()

    if not db.query(models.Voucher).filter(models.Voucher.code == "SEAPEDIA10").first():
        db.add(models.Voucher(
            code="SEAPEDIA10", discount_type=models.DiscountTypeEnum.percent, value=10, max_discount=20000,
            expiry_date=dt.datetime.utcnow() + dt.timedelta(hours=7) + dt.timedelta(days=30), usage_limit=100, usage_count=0,
        ))

    if not db.query(models.Promo).filter(models.Promo.code == "PROMOAWAL").first():
        db.add(models.Promo(
            code="PROMOAWAL", discount_type=models.DiscountTypeEnum.fixed, value=15000,
            expiry_date=dt.datetime.utcnow() + dt.timedelta(hours=7) + dt.timedelta(days=30),
        ))

    db.commit()
    db.close()
    print("Seed complete.")
    print("Admin login: admin / Admin123!")
    print("Seller login: seller1 / Seller123!")
    print("Buyer login: buyer1 / Buyer123! (wallet pre-filled Rp1,000,000)")
    print("Driver login: driver1 / Driver123!")
    print("Multi-role login: multiuser / Multi123! (buyer + seller)")


if __name__ == "__main__":
    main()

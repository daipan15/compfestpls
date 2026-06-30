import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.date_utils import get_wib_now

class DiscountTypeEnum(str, enum.Enum):
    percent = "percent"
    fixed = "fixed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)

    roles = relationship("UserRoleAssignment", back_populates="user", cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    cart = relationship("Cart", back_populates="buyer", uselist=False, cascade="all, delete-orphan")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", foreign_keys="[Order.buyer_id]", back_populates="buyer", cascade="all, delete-orphan")
    store = relationship("Store", back_populates="owner", uselist=False, cascade="all, delete-orphan")

    @property
    def role(self):
        role_list = [r.role for r in self.roles]
        if "admin" in role_list:
            return "admin"
        if "seller" in role_list and "buyer" in role_list:
            return "buyer-seller"
        if "seller" in role_list:
            return "seller"
        if "driver" in role_list:
            return "driver"
        return "buyer"

    @property
    def storeId(self):
        return self.store.id if self.store else None

class UserRoleAssignment(Base):
    __tablename__ = "user_role_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # buyer, seller, admin, driver

    user = relationship("User", back_populates="roles")

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    balance = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    type = Column(String, nullable=False)  # TOPUP, PAYMENT, EARNING
    amount = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=get_wib_now)
    description = Column(String)

    wallet = relationship("Wallet", back_populates="transactions")

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)  # Rumah, Kantor, dll.
    detail = Column(String, nullable=False)

    user = relationship("User", back_populates="addresses")

    @property
    def userId(self):
        return self.user_id

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

    owner = relationship("User", back_populates="store")
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Integer, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    image_url = Column(String, default="")

    store = relationship("Store", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")

    @property
    def reviewsCount(self):
        return len(self.reviews) if self.reviews else 0

    @property
    def rating(self):
        if not self.reviews:
            return 5.0
        return sum(r.rating for r in self.reviews) / len(self.reviews)

    @property
    def storeId(self):
        return self.store_id

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    buyer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    buyer = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)  # e.g., ORD-1234
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subtotal = Column(Integer, nullable=False)
    discount = Column(Integer, default=0)
    total = Column(Integer, nullable=False)
    address = Column(String, nullable=False)
    status = Column(String, default="UNPAID")  # UNPAID, PAID, SHIPPING, DELIVERED, CANCELLED
    cancellation_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_wib_now)
    payment_deadline = Column(DateTime, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="orders")
    driver = relationship("User", foreign_keys=[driver_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order", cascade="all, delete-orphan")

    @property
    def buyerId(self):
        return self.buyer_id

    @property
    def driverId(self):
        return self.driver_id

    @property
    def storeIds(self):
        return [item.product.store_id for item in self.items if item.product]

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Voucher(Base):
    __tablename__ = "vouchers"

    code = Column(String, primary_key=True, index=True)
    discount_type = Column(Enum(DiscountTypeEnum), nullable=False)
    value = Column(Integer, nullable=False)  # percent or flat amount
    max_discount = Column(Integer, default=0)
    min_purchase = Column(Integer, default=0)
    expiry_date = Column(DateTime, nullable=False)
    usage_limit = Column(Integer, default=100)
    usage_count = Column(Integer, default=0)
    active = Column(Integer, default=1)  # 1 for active, 0 for inactive

class Promo(Base):
    __tablename__ = "promos"

    code = Column(String, primary_key=True, index=True)
    discount_type = Column(Enum(DiscountTypeEnum), nullable=False)
    value = Column(Integer, nullable=False)
    expiry_date = Column(DateTime, nullable=False)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)

    order = relationship("Order", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

    @property
    def author(self):
        return self.order.buyer.name if self.order and self.order.buyer else "Pembeli"

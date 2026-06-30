from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from app.models.models import DiscountTypeEnum

# --- Token & Authentication ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserRoleResponse(BaseModel):
    role: str

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    name: str
    password: str
    roles: List[str]

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    name: Optional[str] = None
    roles: List[UserRoleResponse] = []
    role: str
    walletBalance: Optional[int] = 0
    storeId: Optional[int] = None

    class Config:
        from_attributes = True

# --- Address ---
class AddressBase(BaseModel):
    title: str
    detail: str

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Store ---
class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class StoreResponse(StoreBase):
    id: int
    user_id: int
    rating: float = 5.0

    class Config:
        from_attributes = True

# --- Product ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    stock: int
    image_url: Optional[str] = ""

class ProductCreate(ProductBase):
    pass

class ReviewResponse(BaseModel):
    author: str
    rating: int
    comment: Optional[str] = None

    class Config:
        from_attributes = True

class ProductResponse(ProductBase):
    id: int
    store_id: int
    rating: float
    reviewsCount: int
    reviews: List[ReviewResponse] = []

    class Config:
        from_attributes = True

# --- Cart ---
class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    buyer_user_id: int
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True

# --- Wallet ---
class WalletTopUp(BaseModel):
    amount: int

class WalletTransactionResponse(BaseModel):
    id: int
    type: str
    amount: int
    timestamp: datetime
    description: Optional[str] = None

    class Config:
        from_attributes = True

class WalletResponse(BaseModel):
    balance: int
    transactions: List[WalletTransactionResponse] = []

    class Config:
        from_attributes = True

# --- Voucher & Promo ---
class VoucherResponse(BaseModel):
    code: str
    discountType: DiscountTypeEnum
    value: int
    maxDiscount: int
    minPurchase: int
    active: bool

    class Config:
        from_attributes = True

class PromoResponse(BaseModel):
    code: str
    discountType: DiscountTypeEnum
    value: int
    active: bool

    class Config:
        from_attributes = True

# --- Order ---
class OrderItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int
    price: int

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    addressId: int
    voucherCode: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    buyerId: int
    buyerName: str
    items: List[OrderItemResponse] = []
    subtotal: int
    discount: int
    total: int
    address: str
    status: str
    cancellation_reason: Optional[str] = None
    created_at: datetime
    payment_deadline: datetime
    driverId: Optional[int] = None
    driverName: Optional[str] = None
    reviewedProductIds: List[int] = []

    class Config:
        from_attributes = True

# --- Review ---
class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

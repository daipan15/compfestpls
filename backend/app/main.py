from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import (
    auth, address, products, stores, cart, wallet, discounts, orders, delivery, clock, overdue, admin
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Compfest Marketplace API",
    description="Backend API for Compfest E-commerce Marketplace Demo",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set CORS origins to allow any domain in production/development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(address.router, prefix=api_prefix)
app.include_router(products.router, prefix=api_prefix)
app.include_router(stores.router, prefix=api_prefix)
app.include_router(cart.router, prefix=api_prefix)
app.include_router(wallet.router, prefix=api_prefix)
app.include_router(discounts.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(delivery.router, prefix=api_prefix)
app.include_router(clock.router, prefix=api_prefix)
app.include_router(overdue.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": "Compfest Marketplace Backend API",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

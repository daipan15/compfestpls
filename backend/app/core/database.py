import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL

# Vercel Serverless environment is read-only.
# Move SQLite db to /tmp (which is writable) on startup to allow checkouts and modifications.
if os.getenv("VERCEL") or os.getenv("VERCEL_ENV"):
    src_db = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "compfest_db.sqlite"
    )
    dest_db = "/tmp/compfest_db.sqlite"
    
    if not os.path.exists(dest_db):
        if os.path.exists(src_db):
            try:
                shutil.copy2(src_db, dest_db)
            except Exception as e:
                print(f"Error copying database to /tmp: {e}")
        else:
            print(f"Source database not found at {src_db}")
            
    db_url = "sqlite:////tmp/compfest_db.sqlite"

# For SQLite, check_same_thread must be False
engine = create_engine(
    db_url, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session in routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

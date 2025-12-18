import os
import time
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise RuntimeError("❌ DATABASE_URL is missing! Check your .env file.")

# Add retry logic for database connection
def create_db_engine_with_retry(DATABASE_URL, max_retries=5, delay=3):
    for attempt in range(max_retries):
        try:
            engine = create_engine(DATABASE_URL)
            # Test connection
            with engine.connect() as conn:
                print(f"✅ Successfully connected to PostgreSQL (attempt {attempt + 1})")
                return engine
        except OperationalError as e:
            if attempt < max_retries - 1:
                print(f"⚠️  Database connection failed (attempt {attempt + 1}/{max_retries}): {e}")
                print(f"🔄 Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print(f"❌ Failed to connect to database after {max_retries} attempts")
                raise

try:
    engine = create_db_engine_with_retry(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    print("✅ Database engine and session created successfully")
except Exception as e:
    print(f"❌ Database initialization failed: {e}")
    raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
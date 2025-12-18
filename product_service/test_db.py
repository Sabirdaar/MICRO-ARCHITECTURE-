from sqlalchemy import text
from database import engine

# Test simple query
with engine.connect() as conn:
    result = conn.execute(text("SELECT version();"))
    version = result.fetchone()
    print(f"✅ PostgreSQL version: {version[0]}")

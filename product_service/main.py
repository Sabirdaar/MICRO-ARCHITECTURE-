from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models, schemas, crud
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Product Service")

# 👇 Allow React frontend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROOT ----------------
@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Service API"}

# ---------------- CATEGORY ----------------
@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

@app.get("/categories/", response_model=list[schemas.Category])
def get_all_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db=db)

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # delete products in category
    db.query(models.Product).filter(
        models.Product.category_id == category_id
    ).delete()

    db.delete(category)
    db.commit()

    return {"message": "Category deleted successfully", "id": category_id}

# ---------------- PRODUCT ----------------
@app.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@app.get("/products", response_model=list[schemas.Product])
def get_all_products(db: Session = Depends(get_db)):
    return crud.get_products(db=db)

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully", "id": product_id}

# ---------------- SEARCH (PostgreSQL) ----------------
@app.get("/search", response_model=list[schemas.Product])
def search_products(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    return db.query(models.Product).filter(
        or_(
            models.Product.name.ilike(f"%{query}%"),
            models.Product.description.ilike(f"%{query}%")
        )
    ).all()

# ---------------- FILTER ----------------
@app.get("/products/filter", response_model=list[schemas.Product])
def filter_products(
    min_price: float = Query(0),
    max_price: float = Query(999999),
    category_id: int | None = None,
    sort_by: str | None = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Product)

    q = q.filter(
        models.Product.price >= min_price,
        models.Product.price <= max_price
    )

    if category_id:
        q = q.filter(models.Product.category_id == category_id)

    if sort_by == "price_asc":
        q = q.order_by(models.Product.price.asc())
    elif sort_by == "price_desc":
        q = q.order_by(models.Product.price.desc())
    elif sort_by == "newest":
        q = q.order_by(models.Product.id.desc())

    return q.all()

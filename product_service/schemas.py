from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        orm_mode = True


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image: str
    category_id: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    category: Category
    class Config:
        orm_mode = True

# app/modules/categories/schemas.py
from pydantic import BaseModel
from typing import Optional, List


class CategoryBase(BaseModel):
    name: str
    slug: str
    icon_url: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class CategoryWithChildren(CategoryResponse):
    """Categoría con sus subcategorías anidadas"""
    subcategories: List["CategoryResponse"] = []

    class Config:
        from_attributes = True

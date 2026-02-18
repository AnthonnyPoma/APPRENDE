# app/modules/categories/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.modules.categories.models import Category
from app.modules.categories.schemas import CategoryResponse, CategoryCreate, CategoryWithChildren

router = APIRouter(prefix="/categories", tags=["Categorías"])


@router.get("/", response_model=List[CategoryResponse])
def list_categories(
    skip: int = 0,
    limit: int = 50,
    parent_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Lista todas las categorías.
    - Si parent_id es None, devuelve categorías raíz.
    - Si parent_id tiene valor, devuelve subcategorías de ese padre.
    """
    query = db.query(Category)
    
    if parent_id is not None:
        query = query.filter(Category.parent_id == parent_id)
    else:
        query = query.filter(Category.parent_id.is_(None))  # Solo raíces
    
    return query.offset(skip).limit(limit).all()


@router.get("/all", response_model=List[CategoryResponse])
def list_all_categories(db: Session = Depends(get_db)):
    """Lista TODAS las categorías sin filtro de jerarquía."""
    return db.query(Category).all()


@router.get("/{category_id}", response_model=CategoryWithChildren)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Obtiene una categoría con sus subcategorías."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return category


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db)
):
    """Crea una nueva categoría (requiere permisos de admin en producción)."""
    # Verificar slug único
    existing = db.query(Category).filter(Category.slug == category_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="El slug ya existe")
    
    new_category = Category(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

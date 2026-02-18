# app/modules/categories/models.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Category(Base):
    """
    Categorías de cursos con soporte para jerarquía (subcategorías).
    Ejemplos: Programación > Python, Diseño > AutoCAD
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    icon_url = Column(String(255), nullable=True)

    # Relación recursiva para subcategorías
    parent = relationship("Category", remote_side=[id], backref="subcategories")
    
    # Relación con cursos (se definirá back_populates en Course)
    courses = relationship("Course", back_populates="category")

# app/modules/reviews/schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Calificación de 1 a 5 estrellas")
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    course_id: UUID


class ReviewResponse(ReviewBase):
    id: UUID
    course_id: UUID
    user_id: UUID
    instructor_reply: Optional[str] = None
    created_at: datetime
    
    # Datos del usuario (para mostrar nombre)
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewReply(BaseModel):
    """Schema para que el instructor responda a una reseña"""
    instructor_reply: str

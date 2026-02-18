# app/modules/instructors/schemas.py
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from uuid import UUID


class InstructorProfileBase(BaseModel):
    headline: Optional[str] = None
    biography: Optional[str] = None
    social_links: Optional[Dict[str, str]] = {}


class InstructorProfileCreate(InstructorProfileBase):
    pass


class InstructorProfileUpdate(InstructorProfileBase):
    pass


class InstructorProfileResponse(InstructorProfileBase):
    user_id: UUID
    total_students: int = 0
    total_reviews: int = 0
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InstructorPublicProfile(BaseModel):
    """Perfil público visible para estudiantes"""
    user_id: UUID
    full_name: str
    headline: Optional[str] = None
    biography: Optional[str] = None
    social_links: Optional[Dict[str, str]] = {}
    total_students: int = 0
    total_reviews: int = 0

    class Config:
        from_attributes = True

# app/modules/instructors/models.py
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class InstructorProfile(Base):
    """
    Perfil extendido para usuarios con rol INSTRUCTOR.
    Contiene información pública para la página del instructor.
    """
    __tablename__ = "instructor_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    headline = Column(String(200))  # Ej: "Ingeniero Civil | Especialista en AutoCAD"
    biography = Column(Text)  # Biografía completa (puede tener HTML)
    social_links = Column(JSONB, default={})  # {"youtube": "...", "linkedin": "..."}
    total_students = Column(Integer, default=0)
    total_reviews = Column(Integer, default=0)
    verified_at = Column(DateTime, nullable=True)  # Fecha de verificación por admin

    # Relación con User
    user = relationship("User", back_populates="instructor_profile")

# app/modules/reviews/models.py
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Review(Base):
    """
    Reseñas de estudiantes sobre cursos.
    Un estudiante solo puede dejar una reseña por curso.
    """
    __tablename__ = "reviews"
    
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_range'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 estrellas
    comment = Column(Text)
    instructor_reply = Column(Text)  # Respuesta del instructor
    created_at = Column(DateTime, server_default=text("NOW()"))

    # Relaciones
    course = relationship("Course", back_populates="reviews")
    user = relationship("User")

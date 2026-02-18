from sqlalchemy import Column, ForeignKey, DateTime, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    completed_at = Column(DateTime, server_default=text("NOW()"))

    # Relaciones (opcionales por ahora, pero útiles)
    # user = relationship("User")
    # lesson = relationship("Lesson")
    # course = relationship("Course")

    # Constraint para evitar duplicados (un usuario no puede completar la misma lección 2 veces)
    __table_args__ = (
        UniqueConstraint('user_id', 'lesson_id', name='unique_user_lesson_progress'),
    )

# app/modules/courses/models.py
from sqlalchemy import Column, String, Text, DECIMAL, Integer, ForeignKey, DateTime, Enum, text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid


class CourseStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    title = Column(String(200), nullable=False)
    subtitle = Column(String(250))
    slug = Column(String(250), unique=True, nullable=False)
    description = Column(Text)
    
    # Precios
    price = Column(DECIMAL(10, 2), default=0.00)
    original_price = Column(DECIMAL(10, 2), nullable=True)  # Para mostrar descuentos
    currency = Column(String(3), default="USD")
    
    # Metadata
    language = Column(String(50), default="Español")
    level = Column(String(50))  # Principiante, Intermedio, Avanzado
    
    # Media
    thumbnail_url = Column(String(500), nullable=True)
    promotional_video_url = Column(String(500), nullable=True)
    
    status = Column(Enum(CourseStatus), default=CourseStatus.DRAFT)
    created_at = Column(DateTime, server_default=text("NOW()"))
    updated_at = Column(DateTime, server_default=text("NOW()"), onupdate=text("NOW()"))
    
    # Relaciones
    sections = relationship("Section", back_populates="course", order_by="Section.order_index", cascade="all, delete-orphan")
    category = relationship("Category", back_populates="courses")
    reviews = relationship("Review", back_populates="course", cascade="all, delete-orphan")
    objectives = relationship("CourseObjective", back_populates="course", cascade="all, delete-orphan")
    requirements = relationship("CourseRequirement", back_populates="course", cascade="all, delete-orphan")


class CourseObjective(Base):
    """Lo que aprenderás en el curso"""
    __tablename__ = "course_objectives"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    text = Column(String(300), nullable=False)
    display_order = Column(Integer, default=0)

    course = relationship("Course", back_populates="objectives")


class CourseRequirement(Base):
    """Requisitos previos del curso"""
    __tablename__ = "course_requirements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    text = Column(String(300), nullable=False)
    display_order = Column(Integer, default=0)

    course = relationship("Course", back_populates="requirements")


class Section(Base):
    __tablename__ = "sections"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    order_index = Column(Integer, nullable=False)

    # Relaciones
    course = relationship("Course", back_populates="sections")
    lessons = relationship("Lesson", back_populates="section", order_by="Lesson.order_index", cascade="all, delete-orphan")


class LessonType(str, enum.Enum):
    VIDEO = "video"
    PDF = "pdf"
    IMAGE = "image"
    QUIZ = "quiz"


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"))
    title = Column(String(150))
    
    # Tipo de contenido
    lesson_type = Column(
        Enum(LessonType, values_callable=lambda x: [e.value for e in x]),
        default=LessonType.VIDEO
    )
    
    # URL del recurso (video, PDF, imagen)
    video_resource_id = Column(String(255))
    
    # Duración en segundos (para videos)
    duration_seconds = Column(Integer, default=0)
    
    is_free_preview = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

    section = relationship("Section", back_populates="lessons")
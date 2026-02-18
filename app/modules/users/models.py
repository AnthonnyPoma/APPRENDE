# Ubicación: app/modules/users/models.py
import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM as PG_ENUM
from sqlalchemy.orm import relationship
from app.core.database import Base

# Definimos el Enum igual que en la base de datos
class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    INSTRUCTOR = "INSTRUCTOR"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    # id es UUID y se genera automáticamente en la DB
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    
    # Mapeamos el Enum de roles - usa el enum existente en PostgreSQL
    role = Column(
        PG_ENUM('STUDENT', 'INSTRUCTOR', 'ADMIN', name='user_role'),
        default='STUDENT'
    )
    
    is_active = Column(Boolean, default=True)
    
    # Fechas automáticas
    created_at = Column(DateTime, server_default=text("NOW()"))
    updated_at = Column(DateTime, server_default=text("NOW()"), onupdate=text("NOW()"))
    
    # Relación con perfil de instructor (solo si es INSTRUCTOR)
    instructor_profile = relationship("InstructorProfile", back_populates="user", uselist=False)
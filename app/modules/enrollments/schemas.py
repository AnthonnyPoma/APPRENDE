# app/modules/enrollments/schemas.py
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

# Creamos un mini esquema para mostrar info básica del curso dentro de la inscripción
class CourseInEnrollment(BaseModel):
    id: UUID
    title: str
    thumbnail_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class EnrollmentCreate(BaseModel):
    course_id: UUID

class EnrollmentResponse(BaseModel):
    id: UUID
    amount_paid: float
    purchased_at: datetime
    
    # Aquí anidamos el curso
    course: CourseInEnrollment 
    
    model_config = ConfigDict(from_attributes=True)
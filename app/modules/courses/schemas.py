# app/modules/courses/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, List 
from datetime import datetime
from uuid import UUID

# 1. Esquemas de LECCIONES
class LessonCreate(BaseModel):
    title: str
    video_resource_id: str 
    lesson_type: Optional[str] = "video" 
    is_free_preview: Optional[bool] = False

class LessonResponse(BaseModel):
    id: UUID
    title: str
    video_resource_id: str
    lesson_type: str 
    is_free_preview: bool
    
    model_config = ConfigDict(from_attributes=True)

# 2. Esquemas de SECCIONES
class SectionCreate(BaseModel):
    title: str
    order_index: int

class SectionResponse(BaseModel):
    id: UUID
    title: str
    order_index: int
    lessons: List[LessonResponse] = [] 
    model_config = ConfigDict(from_attributes=True)

# 3. Esquemas de CURSOS
class CourseCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = 0.0
    level: Optional[str] = "Principiante"
    category_id: Optional[int] = None
    thumbnail_url: Optional[str] = None 

class CourseResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    title: str
    slug: str
    thumbnail_url: Optional[str] 
    price: float
    description: Optional[str] = None
    level: Optional[str] = None
    status: Optional[str] = "DRAFT" 
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# 4. Esquema DETALLADO
class CourseDetailResponse(CourseResponse):
    sections: List[SectionResponse] = []

# 5. Esquemas de REORDER
class LessonReorder(BaseModel):
    id: UUID
    order_index: int

class SectionReorder(BaseModel):
    id: UUID
    order_index: int
    lessons: List[LessonReorder] = []

class CourseReorderRequest(BaseModel):
    sections: List[SectionReorder]
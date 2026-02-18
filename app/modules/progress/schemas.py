from uuid import UUID
from pydantic import BaseModel
from datetime import datetime

class ProgressLessonToggle(BaseModel):
    lesson_id: UUID
    course_id: UUID

class ProgressResponse(BaseModel):
    lesson_id: UUID
    completed: bool
    completed_at: datetime | None = None

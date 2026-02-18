from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import User
from app.modules.progress.models import UserLessonProgress
from app.modules.progress.schemas import ProgressLessonToggle, ProgressResponse
from typing import List
from uuid import UUID

router = APIRouter(prefix="/progress", tags=["Progreso"])

@router.post("/toggle", response_model=ProgressResponse)
def toggle_lesson_progress(
    data: ProgressLessonToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marca o desmarca una lección como completada.
    Si ya existe, la borra (desmarca). Si no existe, la crea (marca).
    """
    existing_progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == current_user.id,
        UserLessonProgress.lesson_id == data.lesson_id
    ).first()

    if existing_progress:
        # Desmarcar
        db.delete(existing_progress)
        db.commit()
        return ProgressResponse(lesson_id=data.lesson_id, completed=False)
    else:
        # Marcar
        new_progress = UserLessonProgress(
            user_id=current_user.id,
            lesson_id=data.lesson_id,
            course_id=data.course_id
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        return ProgressResponse(
            lesson_id=data.lesson_id, 
            completed=True,
            completed_at=new_progress.completed_at
        )

@router.get("/{course_id}", response_model=List[UUID])
def get_course_progress(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve la lista de IDs de lecciones completadas por el usuario en este curso.
    """
    progress = db.query(UserLessonProgress.lesson_id).filter(
        UserLessonProgress.user_id == current_user.id,
        UserLessonProgress.course_id == course_id
    ).all()
    
    # progress es una lista de tuplas [(uuid,), (uuid,), ...]
    # Lo convertimos a una lista simple [uuid, uuid, ...]
    return [p[0] for p in progress]

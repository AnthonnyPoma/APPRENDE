# app/modules/instructors/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import User, UserRole
from app.modules.instructors.models import InstructorProfile
from app.modules.instructors.schemas import (
    InstructorProfileResponse,
    InstructorProfileUpdate,
    InstructorPublicProfile
)

router = APIRouter(prefix="/instructors", tags=["Instructores"])


@router.get("/me", response_model=InstructorProfileResponse)
def get_my_instructor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtiene el perfil de instructor del usuario logueado."""
    if current_user.role != 'INSTRUCTOR':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los instructores pueden acceder a este recurso"
        )
    
    profile = db.query(InstructorProfile).filter(
        InstructorProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de instructor no encontrado. Completa tu perfil primero."
        )
    
    return profile


@router.put("/me", response_model=InstructorProfileResponse)
def update_my_instructor_profile(
    profile_data: InstructorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualiza o crea el perfil de instructor del usuario logueado."""
    if current_user.role != 'INSTRUCTOR':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los instructores pueden acceder a este recurso"
        )
    
    profile = db.query(InstructorProfile).filter(
        InstructorProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        # Crear nuevo perfil
        profile = InstructorProfile(
            user_id=current_user.id,
            **profile_data.model_dump(exclude_unset=True)
        )
        db.add(profile)
    else:
        # Actualizar existente
        for key, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}", response_model=InstructorPublicProfile)
def get_instructor_public_profile(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Obtiene el perfil público de un instructor (visible para todos)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or user.role != 'INSTRUCTOR':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor no encontrado"
        )
    
    profile = db.query(InstructorProfile).filter(
        InstructorProfile.user_id == user_id
    ).first()
    
    # Combinar datos de User + InstructorProfile
    return InstructorPublicProfile(
        user_id=user.id,
        full_name=user.full_name,
        headline=profile.headline if profile else None,
        biography=profile.biography if profile else None,
        social_links=profile.social_links if profile else {},
        total_students=profile.total_students if profile else 0,
        total_reviews=profile.total_reviews if profile else 0
    )


@router.post("/become-instructor", status_code=status.HTTP_200_OK)
def become_instructor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permite a un estudiante convertirse en instructor.
    En producción, esto podría requerir aprobación de admin.
    """
    if current_user.role == 'INSTRUCTOR':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya eres instructor"
        )
    
    if current_user.role == 'ADMIN':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Los administradores no pueden ser instructores"
        )
    
    # Cambiar rol
    current_user.role = 'INSTRUCTOR'
    
    # Crear perfil vacío
    profile = InstructorProfile(user_id=current_user.id)
    db.add(profile)
    
    db.commit()
    
    return {"message": "¡Felicidades! Ahora eres instructor 🎓", "new_role": "INSTRUCTOR"}

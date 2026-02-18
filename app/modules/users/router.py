# app/modules/users/router.py
from fastapi import APIRouter, Depends
from app.modules.users.models import User
from app.modules.auth.schemas import UserResponse # Reusamos el esquema de respuesta
from app.modules.auth.dependencies import get_current_user # Importamos al portero

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Obtiene la información del usuario actual autenticado.
    Requiere enviar el Token JWT.
    """
    return current_user
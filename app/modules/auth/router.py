from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.users.models import User
from app.modules.auth.schemas import UserCreate, UserResponse, LoginSchema, Token # <--- Importa los nuevos esquemas
from app.core.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordRequestForm # <--- IMPORTANTE: AGREGAR ESTO
router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en la plataforma.
    """
    # 1. Validar si el email ya existe
    user_exists = db.query(User).filter(User.email == user_data.email).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo electrónico ya está registrado."
        )

    # 2. Encriptar la contraseña
    hashed_password = get_password_hash(user_data.password)

    # 3. Crear el objeto Usuario (Modelo DB)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password, # Guardamos el hash, NO la pass real
        full_name=user_data.full_name,
        role="STUDENT" # Por defecto todos son estudiantes
    )

    # 4. Guardar en Base de Datos
    db.add(new_user)
    db.commit()      # Confirma la transacción
    db.refresh(new_user) # Recarga el objeto con el ID generado por la DB

    return new_user

@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), # <--- CAMBIO CLAVE AQUÍ
    db: Session = Depends(get_db)
):
    # NOTA: OAuth2 siempre usa el campo 'username' y 'password'.
    # Aunque el usuario escriba su email, para nosotros viene en form_data.username
    
    # 1. Buscar al usuario (usamos form_data.username porque ahí viaja el email)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. Verificar password
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Crear Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
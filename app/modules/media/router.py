# app/modules/media/router.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse, FileResponse
import shutil
import os
import uuid

router = APIRouter(prefix="/files", tags=["Archivos Multimedia"])

UPLOAD_DIR = "uploads"

@router.post("/upload")
def upload_file(file: UploadFile = File(...)):
    """
    Sube un archivo al servidor local y devuelve la URL pública.
    """
    try:
        # 1. Validar extensión (opcional, pero recomendado)
        # filename = file.filename.lower()
        # if not filename.endswith(('.png', '.jpg', '.jpeg', '.mp4')):
        #    raise HTTPException(status_code=400, detail="Formato no permitido")

        # 2. Generar nombre único (para no sobrescribir archivos con el mismo nombre)
        # Ej: "foto.jpg" -> "a1b2c3d4-foto.jpg"
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = f"{UPLOAD_DIR}/{unique_filename}"

        # 3. Guardar el archivo físicamente
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 4. Devolver la URL
        # En producción, aquí devolverías la URL de tu dominio.
        return {
            "filename": unique_filename,
            "url": f"/media/{unique_filename}", # URL relativa
            "full_url": f"http://localhost:8000/media/{unique_filename}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")

@router.get("/stream/{filename}")
def stream_video(filename: str, request: Request = None):
    """
    Endpoint para streaming de video con soporte de Range Requests.
    Permite avanzar/retroceder (seek) en el video.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")

    if not range_header:
        # Si no hay range, devolver todo el archivo
        return FileResponse(file_path)

    # Parsear Range: bytes=START-END
    video_range = range_header.strip().split("=")[-1]
    range_start, range_end = video_range.split("-")
    range_start = int(range_start)
    range_end = int(range_end) if range_end else file_size - 1
    
    # Calcular longitud del contenido a enviar
    content_length = (range_end - range_start) + 1
    
    def iterfile():
        with open(file_path, "rb") as video:
            video.seek(range_start)
            data = video.read(content_length)
            yield data

    headers = {
        "Content-Range": f"bytes {range_start}-{range_end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(content_length),
        "Content-Type": "video/mp4",
    }

    return StreamingResponse(iterfile(), status_code=206, headers=headers)
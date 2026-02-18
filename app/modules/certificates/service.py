from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime

def generate_certificate_pdf(student_name: str, course_title: str, completion_date: datetime) -> BytesIO:
    """
    Genera un certificado PDF en memoria.
    """
    buffer = BytesIO()
    
    # Configuración de página: A4 u Carta en horizontal
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # --- Diseño del Certificado ---
    
    # Fondo / Borde
    c.setStrokeColor(colors.darkblue)
    c.setLineWidth(5)
    c.rect(0.5 * inch, 0.5 * inch, width - 1 * inch, height - 1 * inch)
    
    c.setStrokeColor(colors.gold)
    c.setLineWidth(2)
    c.rect(0.6 * inch, 0.6 * inch, width - 1.2 * inch, height - 1.2 * inch)

    # Título Principal
    c.setFont("Helvetica-Bold", 40)
    c.setFillColor(colors.darkblue)
    c.drawCentredString(width / 2, height - 2.5 * inch, "Certificado de Finalización")

    # Texto "Otorgado a"
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 3.2 * inch, "Este certificado se otorga a:")

    # Nombre del Estudiante
    c.setFont("Helvetica-Bold", 30)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 4 * inch, student_name)

    # Texto "Por completar satisfactoriamente el curso"
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 5 * inch, "Por completar satisfactoriamente el curso:")

    # Nombre del Curso
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(colors.darkblue)
    c.drawCentredString(width / 2, height - 5.8 * inch, course_title)

    # Fecha
    c.setFont("Helvetica", 12)
    c.setFillColor(colors.gray)
    date_str = completion_date.strftime("%d de %B de %Y")
    c.drawCentredString(width / 2, height - 7 * inch, f"Fecha: {date_str}")

    # Firma (Simulada)
    c.line(width / 2 - 1.5 * inch, 1.5 * inch, width / 2 + 1.5 * inch, 1.5 * inch)
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width / 2, 1.2 * inch, "APPRENDE LMS")

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer

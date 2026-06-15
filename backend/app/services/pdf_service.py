import io
import fitz  # PyMuPDF
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable


def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def generate_cv_pdf(cv_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    navy = colors.HexColor("#0d1117")
    blue = colors.HexColor("#2563eb")

    name_style = ParagraphStyle("Name", fontSize=22, fontName="Helvetica-Bold", textColor=navy, spaceAfter=4)
    contact_style = ParagraphStyle("Contact", fontSize=9, textColor=colors.grey, spaceAfter=2)
    section_style = ParagraphStyle(
        "Section", fontSize=12, fontName="Helvetica-Bold", textColor=blue, spaceBefore=12, spaceAfter=4
    )
    body_style = ParagraphStyle("Body", fontSize=10, spaceAfter=3, leading=14)
    bold_style = ParagraphStyle("Bold", fontSize=10, fontName="Helvetica-Bold", spaceAfter=1)

    story = []
    personal = cv_data.get("personal_info", {})

    if personal.get("full_name"):
        story.append(Paragraph(personal["full_name"], name_style))

    contacts = []
    for field in ["email", "phone", "location", "linkedin", "website"]:
        if personal.get(field):
            contacts.append(personal[field])
    if contacts:
        story.append(Paragraph(" | ".join(contacts), contact_style))

    story.append(HRFlowable(width="100%", thickness=1, color=blue, spaceAfter=8))

    if personal.get("summary"):
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
        story.append(Paragraph(personal["summary"], body_style))

    work = cv_data.get("work_experience", [])
    if work:
        story.append(Paragraph("WORK EXPERIENCE", section_style))
        for job in work:
            title_line = f"{job.get('title', '')} — {job.get('company', '')}"
            date_line = f"{job.get('start_date', '')} – {'Present' if job.get('current') else job.get('end_date', '')}"
            story.append(Paragraph(title_line, bold_style))
            story.append(Paragraph(date_line, contact_style))
            if job.get("description"):
                story.append(Paragraph(job["description"], body_style))
            story.append(Spacer(1, 4))

    education = cv_data.get("education", [])
    if education:
        story.append(Paragraph("EDUCATION", section_style))
        for edu in education:
            degree_line = f"{edu.get('degree', '')} in {edu.get('field', '')} — {edu.get('institution', '')}"
            date_line = f"{edu.get('start_date', '')} – {edu.get('end_date', '')}"
            story.append(Paragraph(degree_line, bold_style))
            story.append(Paragraph(date_line, contact_style))
            story.append(Spacer(1, 4))

    skills = cv_data.get("skills", [])
    if skills:
        story.append(Paragraph("SKILLS", section_style))
        story.append(Paragraph(", ".join(skills), body_style))

    languages = cv_data.get("languages", [])
    if languages:
        story.append(Paragraph("LANGUAGES", section_style))
        story.append(Paragraph(", ".join(languages), body_style))

    certifications = cv_data.get("certifications", [])
    if certifications:
        story.append(Paragraph("CERTIFICATIONS", section_style))
        for cert in certifications:
            story.append(Paragraph(f"• {cert}", body_style))

    doc.build(story)
    return buffer.getvalue()

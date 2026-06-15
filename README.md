# ZenzHire — AI-Powered Career Intelligence Platform

ZenzHire is a full-stack AI-powered career platform 
that helps job seekers build ATS-optimized CVs and 
get intelligent career guidance.

## Features
- AI-powered ATS Checker (7-layer analysis)
- CV Builder with 8 professional templates
- AI Career Copilot powered by Claude API
- Real-time CV preview with PDF export
- JWT authentication
- Free and Pro subscription plans

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy
- Alembic

### AI
- Anthropic Claude API
- sentence-transformers
- PyMuPDF

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env  # Add your credentials
alembic upgrade head
uvicorn app.main:app --reload --port 8000

### Frontend Setup
cd frontend
npm install
cp .env.example .env.local  # Add your credentials
npm run dev

### Environment Variables

Backend .env:
DATABASE_URL=postgresql://user:password@localhost/zenzhire
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=your-api-key
STRIPE_SECRET_KEY=your-stripe-key

Frontend .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000

## License
MIT

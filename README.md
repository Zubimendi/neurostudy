# NeuroStudy - AI Learning Accelerator

Learn faster. Understand deeper.

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- React Native environment setup

### 1. Database Setup
```bash
# Create database
createdb neurostudy

# Run schema
psql neurostudy < database/schema.sql
```

### 2. Backend Setup (Golang)
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
go mod download
go run cmd/api/main.go
```

### 3. AI Worker Setup (Python)
```bash
cd ai-worker
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your OpenAI key
python app/main.py
```

### 4. Mobile App Setup
```bash
# Follow instructions in SETUP_MOBILE.txt
```

## 📁 Project Structure
```
neurostudy/
├── backend/          # Golang API
├── ai-worker/        # Python AI processing
├── mobile/           # React Native app
└── database/         # SQL schemas
```

## 🔗 API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register user
- POST `/api/v1/auth/login` - Login user

### Study Sessions
- POST `/api/v1/upload` - Upload image
- POST `/api/v1/process` - Process with AI
- GET `/api/v1/study/{id}` - Get study session

## 🛠️ Tech Stack
- **Backend**: Golang, PostgreSQL
- **AI**: Python, EasyOCR, OpenAI GPT-4
- **Frontend**: React Native
- **Storage**: Cloudinary

## 📝 License
MIT

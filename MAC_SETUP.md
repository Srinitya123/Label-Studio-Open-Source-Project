# Label Studio - Mac Development Setup

# Prerequisites
- Python 3.9+ (via `python3`)
- Node.js 16+
- npm/yarn
- Git

# Backend Setup

# Using Poetry
```bash
cd ~/Desktop/CSSE-566/label_studio
poetry install
poetry run python manage.py runserver
```

# Backend Commands
- Start server: `poetry run python manage.py runserver` (port 8080)
- Make migrations: `poetry run python manage.py makemigrations`
- Apply migrations: `poetry run python manage.py migrate`
- Django shell: `poetry run python manage.py shell`

# Database & Media Location
- Path: `~/Library/Application Support/label-studio`
- Environment file: `.env` in that directory

# Frontend Setup

```bash
cd ~/Desktop/CSSE-566/web
npm install --legacy-peer-deps
npm run ls:dev
```

Server runs on: `http://localhost:8010/`

# Project Structure
- Main repo: `~/Desktop/CSSE-566`
- Backend: `~/Desktop/CSSE-566/label_studio`
- Frontend: `~/Desktop/CSSE-566/web`

# Important Notes
- Use `poetry` instead of `pip` for package management
- Frontend webpack build has pre-existing configuration issues
- Backend runs on port 8080, Frontend on port 8010

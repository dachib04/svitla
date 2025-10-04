# Data Room MVP (React + Flask + Postgres + S3)

A minimal Data Room app (folders/files CRUD) with a React SPA frontend and Flask API backend.  
Deployed on AWS: Elastic Beanstalk (backend), RDS Postgres (DB), S3 (uploads + static site).

## Live Demo
- Backend API: https://dataroom-env.eba-2maibhrb.eu-north-1.elasticbeanstalk.com
- Frontend: http://svitla-frontend-dachi.s3-website.eu-north-1.amazonaws.com

## Stack
- Frontend: React (TypeScript optional), build hosted on S3 (optional CloudFront)
- Backend: Flask, Gunicorn, SQLAlchemy, Flask-Migrate, Flask-CORS
- DB: PostgreSQL (Amazon RDS)
- Storage: Amazon S3 (file uploads)
- Infra: Elastic Beanstalk (Python 3.x on AL2023)

## Features
- Create nested folders
- Upload/view/rename/delete files (PDF focus)
- Rename/delete folders (cascades)
- Persists metadata in Postgres
- CORS-enabled API for SPA

## Architecture

## Local Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Local DB (default SQLite from config.py) and migrations
export FLASK_APP=app.py
flask db upgrade
flask run  # http://127.0.0.1:5000
### Frontned
cd frontend
npm install
npm start  # http://localhost:3000

## Environment Variables
Backend reads from ENV (see `config.py`):
- `DATABASE_URL` – e.g. `postgresql://USER:PASS@HOST:5432/DBNAME`
- `SECRET_KEY` – Flask secret
- `S3_BUCKET` – S3 bucket name for uploads
- `AWS_REGION` – e.g. `eu-north-1`

## Deploy (summary)
**Backend (EB)**
```bash
cd backend
eb init
eb create dataroom-env --single
eb setenv SECRET_KEY=change-me DATABASE_URL="postgresql://USER:PASS@HOST:5432/DBNAME" S3_BUCKET="your-bucket" AWS_REGION="eu-north-1"
eb deploy

export DATABASE_URL="postgresql://USER:PASS@HOST:5432/DBNAME"
export FLASK_APP=app.py
flask db upgrade

cd frontend
REACT_APP_API_URL=https://dataroom-env.eba-2maibhrb.eu-north-1.elasticbeanstalk.com npm run build
aws s3 mb s3://dataroom-frontend-bucket --region eu-north-1
aws s3 sync build/ s3://dataroom-frontend-bucket --delete


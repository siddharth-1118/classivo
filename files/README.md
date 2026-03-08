# Classivo

> **Classivo** is a modern SaaS for college student management, academic resources, attendance, messaging, notifications, and volunteer/admin dashboards.

## Features

- Authentication (JWT, role-based: Student, Volunteer, Admin)
- Responsive dashboards for each role
- Attendance upload (screenshot, PDF, manual)
- Academic resources upload/download
- Messaging system to admin
- Real notifications with history
- Admin management for students, volunteers, files, departments, classes, subjects
- Real analytics/stats (no demo data!)

## Setup

1. **Install dependencies:**
   ```
   cd apps/api && npm install
   cd apps/web && npm install
   ```
2. **Configure environment variables:**
   ```
   cp .env.example .env
   # Edit .env with PostgreSQL connection, secrets, etc.
   ```
3. **Migrate database:**
   ```
   cd packages/db
   npx prisma migrate dev
   ```
4. **Start backend and frontend:**
   ```
   cd apps/api && npm run dev
   cd apps/web && npm run dev
   ```
5. **Login/Sign up as Student, use provided admin to manage system.**

## Folder Structure

See `/apps/web/pages/` for all UI pages, `/apps/api/src/routes/` for all REST APIs, and `/packages/db/schema.prisma` for DB.

> For Google Antigravity or other AI platforms, ZIP the repo and import as needed.

## License

MIT
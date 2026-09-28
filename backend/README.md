# SFPMS Backend

Flask + MySQL API for the Student Field Placement Management System.
This backend now covers every feature used by the `sfpms-frontend`
React app (previously it only had auth, daily logs, placements,
organizations and supervisor assignment).

## Setup

```bash
cd backend
pip install -r backend/requirements.txt
```

Create the database (only needed once, if you don't already have
`sfpms_db` set up):

```bash
mysql -u root -p -e "CREATE DATABASE sfpms_db"
mysql -u root -p sfpms_db < sfpms_db.sql
```

`backend/config.py` points at `mysql+pymysql://root:@localhost/sfpms_db`
by default — edit it if your MySQL user/password differ.

## Applying the new columns/tables to an existing database

Because this project uses `db.create_all()` (no Alembic migrations)
and you already have a populated `sfpms_db`, run the included
migration script **once** after pulling this update. It's safe to
re-run — it only adds what's missing:

```bash
cd backend
python migrate.py
```

This adds the new columns (`users.phone`, extended `organizations`
fields, `placements.department`/`application_id`, extended
`reports` fields, `supervisor_assignment.role`/`assigned_at`,
`notifications.type`) and creates the brand-new tables
(`applications`, `field_evaluations`, `academic_remarks`,
`system_settings`).

If you're starting from a **fresh** database instead, you don't
need `migrate.py` — just run the app once and `db.create_all()`
will create every table from scratch.

## Running

```bash
cd backend
python app.py
```

Runs on `http://127.0.0.1:5000`. Uploaded files (application
letters, CVs, ID copies, report attachments) are stored under
`backend/uploads/` and served back at `/uploads/<path>`.

## API overview

All endpoints are prefixed with `/api`. All list endpoints support
filtering via query params (see each route file for details).

| Area | Prefix | Notes |
|---|---|---|
| Auth | `/api/auth` | `register`, `login`, `change-password` |
| Users (admin) | `/api/users` | CRUD + `/status` toggle + `/stats` |
| Organizations | `/api/organizations` | CRUD + public `/register` request |
| Applications | `/api/applications` | Multi-step application form incl. file upload; `PUT /:id/status` approves/rejects (approval auto-creates a `Placement`) |
| Placements | `/api/placements` | CRUD |
| Daily logs | `/api/daily-logs` | create, sign-out, list/filter |
| Log reviews | `/api/log-reviews` | supervisor approve/reject a daily log |
| Reports | `/api/reports` | student report submission (file upload) + supervisor review |
| Field evaluations | `/api/evaluations` | field supervisor scoring of a student |
| Academic remarks | `/api/academic-remarks` | academic supervisor remarks/rating |
| Supervisor assignment | `/api/supervisor-assignment` | link students to supervisors |
| Notifications | `/api/notifications` | list/mark-read/delete |
| System settings | `/api/settings` | single-row config used by Admin > System Settings |
| Dashboards | `/api/dashboard/admin`, `/student/:id`, `/field-supervisor/:id`, `/academic-supervisor/:id` | aggregated stats per role |

Application/report submissions accept either `multipart/form-data`
(when uploading files — field names match the frontend form field
names, e.g. `applicationLetter`, `cv`, `studentIdCopy`) or plain
JSON (no files).

## Project layout

```
backend/
  app.py              Flask app + blueprint registration
  config.py            DB URI, upload folder, upload size/type limits
  migrate.py            One-off column/table migration for existing DBs
  models/               SQLAlchemy models (one file per table)
  routes/                Blueprints (one file per resource)
  utils/uploads.py    save_upload() helper used by applications & reports
  uploads/                Uploaded files land here (created automatically)
```

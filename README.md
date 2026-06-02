# 📅 EventHub - Event Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

A full-stack web application for managing campus events, built with React.js, Express.js, and PostgreSQL.

---

## 📝 Description

EventHub is a web-based platform that allows students and staff to discover, register for, and manage campus events. It solves the problem of fragmented event information and manual registration processes.

---

## ✨ Features

- ✅ **User Authentication** - Register and login with role selection (User/Admin)
- ✅ **CRUD Operations** - Create, Read, Update, and Delete events (Admin only)
- ✅ **Attendee Tracking** - Real-time attendee count for each event
- ✅ **Register/Unregister** - Users can register for events or cancel their registration
- ✅ **File Upload** - Upload event posters and images
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Multi-page Navigation** - Home, My Events, and Admin Dashboard

---

## 🛠️ Technologies Used

### Frontend
- React.js
- React Router DOM
- CSS3

### Backend
- Express.js
- Node.js
- JWT (JSON Web Tokens)
- Multer (File Upload)

### Database
- PostgreSQL (hosted on Neon)

---

## 📂 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | User ID |
| username | VARCHAR(50) | Username |
| email | VARCHAR(100) | Email address |
| password_hash | TEXT | Hashed password |
| role | VARCHAR(20) | User or Admin |
| created_at | TIMESTAMP | Registration date |

### Events Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Event ID |
| title | VARCHAR(100) | Event title |
| description | TEXT | Event description |
| date | DATE | Event date |
| time | TIME | Event time |
| location | VARCHAR(100) | Event location |
| image_url | TEXT | Event image URL |
| created_by | INT (FK) | Admin user ID |
| created_at | TIMESTAMP | Creation date |

### Registrations Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Registration ID |
| user_id | INT (FK) | User ID |
| event_id | INT (FK) | Event ID |
| registered_at | TIMESTAMP | Registration date |

---

## 📖 How to Run Locally

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL

### Backend Setup
```bash
cd backend
npm install
npm run dev
### Frontend Setup
cd frontend
npm install
npm start

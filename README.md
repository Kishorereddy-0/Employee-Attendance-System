#Here Is My Project Link
https://employee-attendance-system-ruddy.vercel.app/login# AttendEase - Employee Attendance System

Full-stack attendance tracking app for two roles:
- Employee: mark check-in/check-out and review personal attendance
- Manager: monitor team attendance, analytics, and reports

## Tech Stack
- Frontend: React 18, Redux Toolkit, React Router, Tailwind CSS, Recharts
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Auth: JWT + bcryptjs

## Features

### Employee
- Register/Login
- Check in / Check out
- Attendance history (calendar + daily detail)
- Monthly summary (present, absent, late, half-day, total hours)
- Dashboard with quick actions and recent 7-day data
- Profile update

### Manager
- Login (role-based)
- All employees attendance table
- Filters: employee name, date, status, department
- Team summary and team calendar views
- Reports page with date range + employee filter
- Export CSV report
- Dashboard cards and charts (weekly trend, department stats)

## Required Pages

### Employee
- Login/Register
- Dashboard
- Mark Attendance
- My Attendance History
- Profile

### Manager
- Login
- Dashboard
- All Employees Attendance
- Team Calendar View
- Reports
- Team Stats (extra analytics page)

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Attendance (Employee)
- `POST /api/attendance/checkin`
- `POST /api/attendance/checkout`
- `GET /api/attendance/my-history`
- `GET /api/attendance/my-summary`
- `GET /api/attendance/today`

### Attendance (Manager)
- `GET /api/attendance/all`
- `GET /api/attendance/employee/:id`
- `GET /api/attendance/summary`
- `GET /api/attendance/export`
- `GET /api/attendance/today-status`

### Dashboard
- `GET /api/dashboard/employee`
- `GET /api/dashboard/manager`

## Database Schema

### Users
- `id`
- `name`
- `email`
- `password` (hashed)
- `role` (`employee` | `manager`)
- `employeeId` (unique)
- `department`
- `createdAt`

### Attendance
- `id`
- `userId`
- `date` (`YYYY-MM-DD`)
- `checkInTime`
- `checkOutTime`
- `status` (`present` | `absent` | `late` | `half-day`)
- `totalHours`
- `createdAt`

## Project Structure

```text
attendance-system-main/
  client/
    public/
    src/
      components/
      pages/
        auth/
        employee/
        manager/
      services/
      store/
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      seed.js
  .env.example
  package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
npm run install:all
```

### 2. Configure environment
Copy `.env.example` to `server/.env` and set values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed sample data
```bash
npm run seed
```

### 4. Run app
```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Demo Credentials
- Manager: `kishorereddy@company.com` / `062004`
- Employees: 10 random users are generated on each seed with password `password123`

## Scripts
- Root:
  - `npm run dev` - run server + client
  - `npm run server` - run backend only
  - `npm run client` - run frontend only
  - `npm run seed` - seed demo data
- Server:
  - `npm run dev` - nodemon
- Client:
  - `npm run dev` - Vite
  - `npm run build` - production build

## Evaluation Mapping
- Functionality (40): role-based auth, check-in/out flow, history, dashboards, reports, CSV export
- Code Quality (25): modular routes/controllers, Redux slices, reusable components
- UI/UX (15): responsive layout, charts, calendar, status badges, consistent branding
- API Design (10): REST endpoints with role protection and filtered queries
- Database (5): normalized user + attendance models with unique indexes
- Documentation (5): setup guide, env config, scripts, endpoint list, demo credentials

## Screenshots (to add before submission)
Add these into `README.md` before final submission:
- Login/Register
- Employee Dashboard
- Employee Attendance History Calendar
- Manager Dashboard
- Manager Reports + CSV export

## Notes
- If local MongoDB is unavailable, backend falls back to an in-memory MongoDB for easier demo.
- For final judging, use a real MongoDB connection string in `server/.env`.

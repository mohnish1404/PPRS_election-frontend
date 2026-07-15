# 🗳️ Election Employee Management System — Frontend

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Private-red)

A modern, responsive **Election Employee Management Portal** built for the **Government of Chhattisgarh**. This system allows administrators to manage election duty assignments, employee randomization, user approvals, and exemptions — while providing employees with a secure portal to track their application status.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Pages & Components](#-pages--components)
- [API Integration](#-api-integration)
- [Responsive Design](#-responsive-design)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 👨‍💼 Admin Panel
- ✅ **Pending Approvals** — Approve/Reject user registration requests with mandatory rejection reason
- ✅ **Bulk Actions** — Select multiple requests and bulk approve/reject with confirmation
- ✅ **Manage Users** — View all registered users, activate/deactivate, export to Excel/PDF
- ✅ **User Detail Drawer** — Right-side slide panel with profile info + audit logs timeline
- ✅ **Election Randomization** — Assign polling duties to employees by AC, designation, and availability
- ✅ **Randomization Report** — View, filter, and export all assigned duties
- ✅ **Duty Exemption** — Exempt employees from duty with mandatory document upload (PDF/DOC, max 5MB)
- ✅ **Exemption History** — View all exemptions with document download + restore option
- ✅ **Audit Logs** — Track who activated/deactivated users and when
- ✅ **Toast Notifications** — Real-time success/error feedback (no browser alerts)
- ✅ **Sortable Columns** — Sort Pending Approvals by Requested Date
- ✅ **Relative Time** — "2 hours ago" style timestamps
- ✅ **Skeleton Loaders** — Professional loading states for tables
- ✅ **Empty States** — Illustrated empty states with messages

### 👤 User Dashboard
- ✅ **Home** — Welcome hero card, stat chips, recent activity timeline
- ✅ **Application Status** — Visual 3-step progress stepper (Registered → Under Review → Approved/Rejected)
- ✅ **My Profile** — Full profile with cover banner, stat chips, info grid, mobile number
- ✅ **Edit Profile** — Update mobile number and email with validation
- ✅ **Notifications** — Real-time notification cards with read/unread tracking, filter tabs
- ✅ **Help & Support** — FAQ accordion + helpline hero card

### 🔐 Authentication
- ✅ JWT-based authentication
- ✅ OTP login (Email/Mobile)
- ✅ Password login with CAPTCHA
- ✅ Forgot Password with OTP verification
- ✅ Role-based route protection (Admin / User)
- ✅ Auto-logout on token expiry

### 📱 Responsive Design
- ✅ Mobile-first responsive layout
- ✅ Hamburger sidebar on mobile
- ✅ Card-view table on mobile (converts table rows to cards)
- ✅ Bottom-sheet modals on mobile
- ✅ Touch-friendly buttons and inputs

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | UI Framework |
| **Vite** | 5.x | Build Tool & Dev Server |
| **React Router DOM** | 6.x | Client-side Routing |
| **Axios** | 1.x | HTTP Client |
| **XLSX (SheetJS)** | 0.18.x | Excel Export |
| **jsPDF** | 2.x | PDF Export |
| **jspdf-autotable** | 3.x | PDF Table Generation |
| **Lucide React** | 0.383.x | Icon Library |
| **TailwindCSS** | 3.x | Utility CSS (UserDashboard) |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── AdminPanel.jsx          # Main admin dashboard (approvals, users, randomization)
│   ├── UserDashboard.jsx       # User portal (home, profile, status, notifications)
│   ├── LoginPage.jsx           # Login with OTP/Password + CAPTCHA
│   ├── RegisterPage.jsx        # New user registration
│   ├── ForgotPasswordPage.jsx  # Forgot password with OTP
│   ├── ActivateUserPage.jsx    # Account activation
│   ├── DutyReport.jsx          # Randomization report with exemption feature
│   └── Randomization.jsx       # Election duty assignment
│
├── components/
│   ├── ExemptDutyModal.jsx         # Duty exemption modal with file upload
│   └── ExemptionHistoryModal.jsx   # Exemption history with restore option
│
├── services/
│   ├── api.js                  # Axios instance + all API calls
│   └── mastersService.js       # Master data (AC list, designations, etc.)
│
├── utils/
│   ├── auth.js                 # Token management, back button disable
│   └── language.js             # Language toggle utility
│
└── App.jsx                     # Route definitions + protected routes
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- Backend API running (see [Backend README](../election-backend/README.md))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/election-frontend.git

# 2. Navigate to project folder
cd election-frontend

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env

# 5. Update .env with your backend URL (see Environment Variables section)

# 6. Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5103/api
```

> ⚠️ Never commit `.env` to Git. It's already in `.gitignore`.

For production, set:
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

---

## 📜 Available Scripts

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

---

## 📄 Pages & Components

### Admin Panel (`/admin`)
| Section | Description |
|---|---|
| Pending Approvals | Review and approve/reject user registrations |
| Manage Users | Full user management with export |
| Election Randomization | Assign polling duties |
| Randomization Report | View/filter/export assigned duties |

### User Dashboard (`/user-dashboard`)
| Section | Description |
|---|---|
| Home | Welcome card + stats + activity |
| Application Status | 3-step approval stepper |
| My Profile | View + edit profile |
| Notifications | Read/unread notification tracking |
| Help & Support | FAQ accordion + helpline |

---

## 🔗 API Integration

All API calls are centralized in `src/services/api.js`.

```javascript
// Base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// Auth token auto-attached via interceptor
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Key API Endpoints Used

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | New registration |
| GET | `/auth/my-profile` | Get user profile |
| PUT | `/auth/update-profile` | Update profile |
| GET | `/Admin/pending-approvals` | Get pending requests |
| POST | `/Admin/approve/{id}` | Approve request |
| POST | `/Admin/reject/{id}` | Reject request |
| GET | `/Admin/users` | Get all users |
| POST | `/Admin/toggle-user/{userId}` | Activate/Deactivate user |
| GET | `/Admin/assigned-duties` | Get duty assignments |
| POST | `/Admin/exemptions` | Grant duty exemption |
| GET | `/Admin/exemptions` | Get exemption history |
| POST | `/Admin/exemptions/{id}/restore` | Restore exemption |
| GET | `/Admin/audit-logs/{userId}` | Get user audit logs |

---

## 📱 Responsive Design

| Screen | Behavior |
|---|---|
| Desktop (>768px) | Full sidebar, table layout, side-by-side modals |
| Mobile (≤768px) | Hamburger menu, card-view table, bottom-sheet modals |

---

## 👨‍💻 Developer Notes

- **Admin login:** Use credentials set up in the backend database
- **JWT token** is stored in `localStorage` and auto-attached to all requests
- **Role-based protection:** Admin routes check for `Admin` role in JWT payload
- **CAPTCHA** is canvas-based, generated client-side
- **File uploads** (exemption documents) use `multipart/form-data`

---

## 📞 Support

For issues, contact the development team or raise a GitHub issue.

---

*Built with ❤️ for Government of Chhattisgarh Election Commission*

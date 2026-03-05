# 💰 Expense Tracker (Full Stack)

> A full stack expense tracking web application that allows users to manage their personal finances.

---

## 📋 Overview

Users can **register**, **log in securely** using JWT authentication, **add expenses**, **view analytics**, and **track spending patterns** — all from a clean, modern React interface backed by an ASP.NET Core REST API.

---

## ✨ Features

- ✅ User Registration and Login
- ✅ JWT Authentication (secure, stateless)
- ✅ Add and Manage Expenses
- ✅ Expense Dashboard (real-time summary)
- ✅ Category-wise Expense Summary
- ✅ Pagination and Date Filtering
- ✅ Monthly Expense Analytics
- ✅ RESTful API Integration

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| Axios | HTTP client |
| JavaScript (ES6+) | Logic & state |
| CSS (Vanilla) | Styling & animations |

### Backend
| Technology | Purpose |
|---|---|
| ASP.NET Core Web API | REST API server |
| Entity Framework Core | ORM / database access |
| JWT Authentication | Stateless auth tokens |

### Database
| Technology | Purpose |
|---|---|
| SQL Server / LocalDB | Persistent data storage |

---

## 📁 Project Structure

```
expense-tracker-fullstack/
│
├── ExpenseTrackerAPI/              ← Backend (ASP.NET Core API)
│   ├── Controllers/                ← API endpoints
│   ├── DTOs/                       ← Data Transfer Objects
│   ├── Data/                       ← DbContext
│   ├── Models/                     ← Entity models
│   ├── Repositories/               ← Data access layer
│   ├── Services/                   ← Business logic
│   ├── Migrations/                 ← EF Core migrations
│   ├── Program.cs                  ← App entry point
│   └── appsettings.json            ← Configuration (update Key before running)
│
└── expense-tracker-frontend/       ← Frontend (React)
    ├── public/                     ← Static assets
    └── src/
        ├── components/             ← Reusable UI components
        ├── pages/                  ← Page-level components
        ├── services/               ← API service (Axios calls)
        └── App.js                  ← Root component & routing
```

---

## 🚀 How to Run the Project

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- SQL Server or LocalDB

---

### Backend

```bash
# 1. Navigate to the backend folder
cd ExpenseTrackerAPI

# 2. Restore NuGet packages
dotnet restore

# 3. Update appsettings.json — set your own JWT Key and connection string

# 4. Apply database migrations
dotnet ef database update

# 5. Run the API
dotnet run
```

The API will start at `http://localhost:5269` by default.

---

### Frontend

```bash
# 1. Navigate to the frontend folder
cd expense-tracker-frontend

# 2. Install Node modules
npm install

# 3. Start the development server
npm start
```

The React app will open at `http://localhost:3000`.

> **Note:** Make sure the backend is running before using the frontend. Update the API base URL in `src/services/api.js` if needed.

---

## 🔐 Security Notes

- The JWT secret key in `appsettings.json` is a **placeholder** — replace `YOUR_SECRET_KEY_HERE` with a strong, randomly generated value before deploying.
- Never commit real secrets to version control.

---

## 🔮 Future Improvements

- 📊 Expense Charts and Visual Analytics
- 📄 Export Reports (PDF / CSV)
- 📱 Full Mobile Responsive UI
- ☁️ Cloud Deployment (Azure / AWS)
- 🔔 Budget Alerts and Notifications

---

## 👤 Author

**Samiksha** — [GitHub @Samikshaa27](https://github.com/Samikshaa27)

---

*© 2026 ExpenseTracker. All rights reserved.*

# Abanob Premier League (دوري القديس أبانوب)

A professional tournament management system designed for church competitions where multiple teams compete in several categories and receive scores from judges. It provides professional ranking, analytics, statistics, and administration tools.

## Features

- **Admin Dashboard**: Manage teams, categories, scores, and seasons.
- **Matrix Score Editing**: Fast, inline scoring for judges with auto-save.
- **Dynamic Scoring**: Flexible categories and max score configurations.
- **Real-Time Standings**: View standings, rankings, and statistics dynamically.
- **Hall of Fame**: Discover category champions and overall season winners.
- **Exporting**: Excel and PDF reports for standings.
- **Premium UI**: Modern dark/light mode UI with glassmorphism, gold accents, and animated charts.
- **Analytics**: Detailed Radar Charts and Bar Charts for team and category performance insights.

## Architecture

- **Frontend**: Vite + React + TypeScript + Tailwind CSS v4 + Context API for State + Recharts for charts.
- **Backend**: ASP.NET Core 8 Web API + Entity Framework Core (SQLite) + Clean Architecture (Domain, Application, Infrastructure, API).
- **Authentication**: JWT authentication with refresh token logic.

## Getting Started

### Prerequisites
- Node.js 20+
- .NET 8.0 SDK

### 1. Setup Backend
```bash
cd backend
# The SQLite database is already created and seeded with default data.
# Run the backend API:
dotnet run --project src/AbanobLeague.API/AbanobLeague.API.csproj
```
The backend will run on `https://localhost:7176` and `http://localhost:5102`.
Swagger UI is available at `https://localhost:7176/swagger`.

**Default Admin Credentials:**
- Email: `admin@abanob.com`
- Password: `Admin@123456`

### 2. Setup Frontend
```bash
cd frontend
npm install
# Run the frontend dev server:
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Deployment
- **Backend**: Can be published using `dotnet publish` and hosted on IIS, Azure App Service, or Docker. Ensure `appsettings.Production.json` is configured properly (e.g., using SQL Server instead of SQLite).
- **Frontend**: Run `npm run build` to generate the production static files in `frontend/dist`. These can be served using any static web host (Nginx, Vercel, Netlify).

## License
Created for Abanob Church. All rights reserved.

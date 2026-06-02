# Abanob Premier League

An Arabic-first tournament management system for church competitions. It manages seasons, teams, team members, evaluation categories, scores, standings, analytics, and public leaderboards.

## Highlights

- Season-based competition management
- Team registration with up to 10 members per team
- Individual member scoring in addition to team scoring
- Public standings, live leaderboard, hall of fame, and analytics pages
- Admin dashboards for managing seasons, teams, categories, team scores, and member scores
- Auto-save scoring matrix for fast judge input
- Export to Excel and PDF
- JWT-based admin authentication
- Modern responsive UI with dark/light mode

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Recharts
- Axios

### Backend

- ASP.NET Core 8 Web API
- Entity Framework Core
- SQLite
- JWT authentication
- Swagger / OpenAPI

### Architecture

- Clean Architecture style with:
  - `Domain`
  - `Application`
  - `Infrastructure`
  - `API`

## Main Features

### Public Site

- Home page with season overview and highlights
- Team standings
- Individual member leaderboard
- Live leaderboard
- Hall of fame
- Analytics and charts
- Team profile pages

### Admin Panel

- Manage seasons
- Manage teams and team members
- Manage categories
- Enter and edit team scores
- Enter and edit individual member scores
- Audit logs

## Database

- DBMS: **SQLite**
- Default database file: `AbanobLeague.db`

## Prerequisites

- Node.js 20 or newer
- .NET 8 SDK

## Run Locally

### 1. Backend

From the repository root:

```bash
cd backend
dotnet run --project src/AbanobLeague.API/AbanobLeague.API.csproj
```

The API starts with:

- `http://localhost:5102`
- `https://localhost:7176`

Swagger:

- `https://localhost:7176/swagger`

### 2. Frontend

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at:

- `http://localhost:5173`

## Default Admin Login

If the seed data is present, the default admin account is:

- Email: `admin@abanob.com`
- Password: `Admin@123456`

## Project Structure

```text
backend/
  src/
    AbanobLeague.API/
    AbanobLeague.Application/
    AbanobLeague.Domain/
    AbanobLeague.Infrastructure/
frontend/
  src/
    components/
    context/
    hooks/
    pages/
    services/
    types/
```

## Useful Public Routes

- `/` - Home
- `/standings` - Team standings
- `/members` - Individual leaderboard
- `/live` - Live leaderboard
- `/hall-of-fame` - Hall of fame
- `/analytics` - Analytics

## Useful Admin Routes

- `/admin/dashboard`
- `/admin/seasons`
- `/admin/teams`
- `/admin/categories`
- `/admin/scores`
- `/admin/member-scores`
- `/admin/audit-logs`

## Notes

- When you add a season, teams, or members, the system stores them under the selected season.
- Deleting a season removes all data linked to that season.
- Team totals and individual member totals are both tracked and shown in the UI.

## Build for Production

### Backend

```bash
cd backend
dotnet build
dotnet publish src/AbanobLeague.API/AbanobLeague.API.csproj -c Release
```

### Frontend

```bash
cd frontend
npm run build
```

The production frontend bundle is generated in `frontend/dist`.

## License

Created for Abanob Church. All rights reserved.

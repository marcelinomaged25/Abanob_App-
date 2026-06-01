# Abanob Premier League — Implementation Plan

Complete production-ready tournament management system for a church competition.

## Project Structure Overview

```
e:\projects\abanob\
├── backend/                          # ASP.NET Core 8 Solution
│   ├── AbanobLeague.sln
│   ├── src/
│   │   ├── AbanobLeague.Domain/       # Entities, Enums, Interfaces (zero deps)
│   │   ├── AbanobLeague.Application/  # DTOs, Services, Interfaces, Validators
│   │   ├── AbanobLeague.Infrastructure/ # EF Core, Repos, Auth, Seed Data
│   │   └── AbanobLeague.API/          # Controllers, Middleware, DI, Program.cs
│   └── tests/
│       └── AbanobLeague.Tests/
├── frontend/                         # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   # Shadcn UI components
│   │   │   ├── layout/               # Header, Footer, Sidebar, etc.
│   │   │   ├── public/               # Public-facing components
│   │   │   └── admin/                # Admin-specific components
│   │   ├── pages/                    # Route-level page components
│   │   │   ├── public/               # Public pages
│   │   │   └── admin/                # Admin pages
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # API service layer
│   │   ├── types/                    # TypeScript type definitions
│   │   ├── lib/                      # Utility functions
│   │   ├── context/                  # React context providers
│   │   └── assets/                   # Static assets
│   └── public/
└── README.md
```

---

## User Review Required

> [!IMPORTANT]
> **SQL Server Requirement**: The plan uses SQL Server as the database. Please confirm you have SQL Server (or SQL Server Express / LocalDB) installed, or if you'd prefer SQLite for easier local development.

> [!IMPORTANT]
> **Tailwind CSS Version**: The user specified Tailwind CSS. The plan uses **Tailwind CSS v4** (latest, 2025/2026 standard) with the `@tailwindcss/vite` plugin. This is the modern approach with no `tailwind.config.js` file — all theming is done via CSS `@theme` directives. Confirm this is acceptable.

> [!IMPORTANT]
> **Admin Seed Credentials**: The seed data will create a default admin with email `admin@abanob.com` and password `Admin@123456`. These should be changed in production.

---

## Open Questions

> [!NOTE]
> **Team Logos**: Should logos be stored as files on the server filesystem, or as base64-encoded strings in the database? File storage is recommended for production. The plan assumes file storage in `wwwroot/uploads/logos/`.

> [!NOTE]
> **Ranking History**: The spec mentions "Store ranking history" for the live leaderboard movement indicators. Should we store a snapshot of rankings every time scores change, or on a daily basis? The plan assumes **per-score-change snapshots**.

> [!NOTE]
> **PDF Reports**: The plan uses a frontend-only approach (jsPDF + html2canvas) for PDF export rather than a server-side PDF library, keeping the backend simpler. Is this acceptable?

---

## Proposed Changes

### Phase 1: Backend — Domain Layer

#### [NEW] AbanobLeague.Domain

Core entities with zero external dependencies:

- **Entities/**
  - `Season.cs` — Id, Name, Description, StartDate, EndDate, IsActive, CreatedAt
  - `Team.cs` — Id, Name, LogoUrl, Description, SeasonId, CreatedAt + nav props
  - `Category.cs` — Id, Name, MaxScore, Order, SeasonId + nav props
  - `Score.cs` — Id, TeamId, CategoryId, Score, Notes, UpdatedAt + nav props
  - `AdminUser.cs` — Id, FullName, Email, PasswordHash, Role, CreatedAt
  - `AuditLog.cs` — Id, UserId, Action, EntityName, EntityId, OldValue, NewValue, Timestamp
  - `RankingSnapshot.cs` — Id, TeamId, SeasonId, Rank, TotalScore, SnapshotDate
- **Enums/**
  - `AdminRole.cs` — SuperAdmin, Admin
- **Interfaces/**
  - `IRepository<T>` — Generic repository interface
  - `ISeasonRepository`, `ITeamRepository`, `ICategoryRepository`, `IScoreRepository`
  - `IAuditLogRepository`, `IRankingSnapshotRepository`, `IAdminUserRepository`
  - `IUnitOfWork` — Transaction management

---

### Phase 2: Backend — Application Layer

#### [NEW] AbanobLeague.Application

Business logic, DTOs, service interfaces:

- **DTOs/**
  - `SeasonDto`, `CreateSeasonDto`, `UpdateSeasonDto`
  - `TeamDto`, `CreateTeamDto`, `UpdateTeamDto`, `TeamProfileDto`, `TeamRankingDto`
  - `CategoryDto`, `CreateCategoryDto`, `UpdateCategoryDto`
  - `ScoreDto`, `UpdateScoreDto`, `ScoreMatrixDto`
  - `StandingsDto`, `LeaderboardEntryDto`
  - `HallOfFameDto`, `CategoryChampionDto`
  - `AnalyticsDto`, `QuickStatsDto`
  - `AuditLogDto`
  - `LoginDto`, `TokenDto`, `RefreshTokenDto`
  - `PaginatedResult<T>`
- **Interfaces/**
  - `ISeasonService`, `ITeamService`, `ICategoryService`, `IScoreService`
  - `IRankingService`, `IAnalyticsService`, `IAuditService`
  - `IAuthService`, `ITokenService`
- **Services/**
  - `SeasonService` — CRUD + activate/deactivate
  - `TeamService` — CRUD + logo upload
  - `CategoryService` — CRUD + reorder
  - `ScoreService` — CRUD + validation + matrix view
  - `RankingService` — Calculate rankings, generate snapshots, movement tracking
  - `AnalyticsService` — Compute insights (highest/lowest/most consistent/strongest category)
  - `AuditService` — Log all modifications
  - `AuthService` — Login, JWT generation, refresh tokens
- **Validators/**
  - FluentValidation validators for all create/update DTOs
- **Mappings/**
  - AutoMapper profiles for Entity ↔ DTO conversions

---

### Phase 3: Backend — Infrastructure Layer

#### [NEW] AbanobLeague.Infrastructure

EF Core implementation, persistence, auth:

- **Data/**
  - `AppDbContext.cs` — DbContext with all entity configurations
  - `Configurations/` — IEntityTypeConfiguration for each entity
  - `Migrations/` — EF Core migrations
- **Repositories/**
  - Generic `Repository<T>` implementation
  - Specialized repositories for complex queries
  - `UnitOfWork.cs`
- **Auth/**
  - `TokenService.cs` — JWT + Refresh Token generation
  - `PasswordHasher.cs` — BCrypt password hashing
- **Seed/**
  - `DataSeeder.cs` — 10 teams, 7 categories, realistic scores, default admin
- **DependencyInjection.cs** — Extension method to register all Infrastructure services

---

### Phase 4: Backend — API Layer

#### [NEW] AbanobLeague.API

Controllers, middleware, configuration:

- **Controllers/**
  - `AuthController` — POST /api/auth/login, POST /api/auth/refresh
  - `SeasonsController` — Full CRUD + GET /api/seasons/active
  - `TeamsController` — Full CRUD + GET /api/teams/{id}/profile + logo upload
  - `CategoriesController` — Full CRUD + PUT /api/categories/reorder
  - `ScoresController` — CRUD + GET /api/scores/matrix
  - `StandingsController` — GET /api/standings (with pagination, sorting, filtering)
  - `LeaderboardController` — GET /api/leaderboard (with movement indicators)
  - `HallOfFameController` — GET /api/hall-of-fame
  - `AnalyticsController` — GET /api/analytics
  - `AuditLogsController` — GET /api/audit-logs (admin only, paginated)
  - `QuickStatsController` — GET /api/quick-stats
- **Middleware/**
  - `ExceptionHandlingMiddleware` — Global exception handler
  - `AuditMiddleware` — Auto-capture audit context
- **Configuration/**
  - `appsettings.json` — Connection strings, JWT settings, CORS
  - `Program.cs` — Clean DI registration with extension methods
- **Swagger** — OpenAPI documentation with JWT bearer support

---

### Phase 5: Frontend — Project Setup

#### [NEW] frontend/

Scaffolding with Vite + React + TypeScript + Tailwind CSS v4 + Shadcn UI:

1. `npm create vite@latest ./ -- --template react-ts`
2. Install Tailwind CSS v4: `npm install tailwindcss @tailwindcss/vite`
3. Install dependencies: `react-router-dom`, `@tanstack/react-query`, `recharts`, `axios`, `lucide-react`, `clsx`, `tailwind-merge`, `jspdf`, `xlsx`, `date-fns`
4. Initialize Shadcn UI: `npx shadcn@latest init`
5. Add Shadcn components: button, card, input, table, dialog, dropdown-menu, toast, tabs, badge, skeleton, avatar, sheet, separator, command, popover, select, textarea, label, switch

---

### Phase 6: Frontend — Design System & Layout

#### [NEW] src/index.css
Custom theme using Tailwind CSS v4 `@theme` directive:
- Brand colors: Navy `#0B2A5B`, Gold `#D4AF37`
- Dark mode support via CSS custom properties
- Typography scale using Inter font from Google Fonts
- Custom animations (fade-in, slide-up, counter, shimmer)
- Glassmorphism utilities

#### [NEW] src/components/layout/
- `PublicLayout.tsx` — Header + main content + footer for public pages
- `AdminLayout.tsx` — Sidebar + header + content area for admin pages
- `Header.tsx` — Navigation with dark mode toggle, season selector
- `Footer.tsx` — Branded footer
- `AdminSidebar.tsx` — Collapsible sidebar with navigation
- `ThemeProvider.tsx` — Dark/light mode context

---

### Phase 7: Frontend — Public Pages

#### [NEW] src/pages/public/

##### HomePage.tsx
- Hero section with animated gradient background, church-inspired geometric patterns
- Quick stats section with animated counters (team count, category count, leader, highest score)
- Podium section showing top 3 teams with gold/silver/bronze medals
- Season highlights cards

##### StandingsPage.tsx
- Professional league table with dynamic category columns
- Search bar, column sorting, pagination
- Export buttons (PDF, Excel)
- Rank badges with color coding (gold, silver, bronze for top 3)

##### TeamProfilePage.tsx
- Team header with logo, name, rank badge, total score
- Radar chart showing category performance
- Progress bars for each category (score vs max)
- Performance cards with percentages
- Ranking history chart

##### LeaderboardPage.tsx
- Real-time leaderboard with rank, team, total score
- Movement indicators (up/down/unchanged arrows)
- Animated rank transitions

##### HallOfFamePage.tsx
- Best Team Overall — large trophy card
- Category Champions — grid of champion cards per category
- Achievement badges display

##### AnalyticsPage.tsx
- Metric cards: highest/lowest scoring, most consistent, strongest/most competitive category
- Bar chart: scores by category across teams
- Radar chart: team comparison
- Pie chart: score distribution
- Line chart: ranking trends over time

##### SeasonsPage.tsx
- Browse previous seasons
- Season cards with date ranges and stats

---

### Phase 8: Frontend — Admin Pages

#### [NEW] src/pages/admin/

##### LoginPage.tsx
- Premium login form with branded styling
- JWT token storage in httpOnly-equivalent (localStorage with refresh)

##### DashboardPage.tsx
- Overview cards: Total Teams, Categories, Scores, Active Season
- Current Leader widget
- Top 5 Teams mini-leaderboard
- Closest Competition widget
- Recent Updates feed
- Category Leaders grid
- Teams at Risk alerts

##### ManageTeamsPage.tsx
- Data table with search, pagination
- Create/Edit team dialog with logo upload
- Delete confirmation dialog

##### ManageCategoriesPage.tsx
- Sortable list with drag-and-drop reorder
- Create/Edit category dialog with MaxScore setting
- Delete confirmation

##### ManageScoresPage.tsx
- Score matrix table (teams as rows, categories as columns)
- Inline editing with validation (0 to MaxScore)
- Auto-save with debounce
- Visual feedback on save

##### ManageSeasonsPage.tsx
- Season list with active indicator
- Create/Edit season dialog
- Activate season toggle (deactivates others)

##### AuditLogsPage.tsx
- Searchable, paginated audit log table
- Filter by action type, entity, date range
- Old value / new value comparison

##### ReportsPage.tsx
- Report type selection (Rankings, Hall of Fame, Analytics, Scores)
- Format selection (PDF, Excel)
- Preview and download

---

### Phase 9: Frontend — Services & Hooks

#### [NEW] src/services/
- `api.ts` — Axios instance with JWT interceptor, refresh token logic
- `authService.ts` — Login, logout, refresh
- `seasonService.ts` — Season CRUD
- `teamService.ts` — Team CRUD + logo upload
- `categoryService.ts` — Category CRUD + reorder
- `scoreService.ts` — Score CRUD + matrix
- `standingsService.ts` — Fetch standings
- `leaderboardService.ts` — Fetch leaderboard
- `hallOfFameService.ts` — Fetch hall of fame data
- `analyticsService.ts` — Fetch analytics
- `auditService.ts` — Fetch audit logs
- `statsService.ts` — Fetch quick stats

#### [NEW] src/hooks/
- `useAuth.ts` — Authentication state & actions
- `useSeasons.ts` — React Query hooks for seasons
- `useTeams.ts` — React Query hooks for teams
- `useCategories.ts` — React Query hooks for categories
- `useScores.ts` — React Query hooks for scores
- `useStandings.ts` — React Query hooks for standings
- `useAnalytics.ts` — React Query hooks for analytics
- `useTheme.ts` — Dark/light mode toggle
- `useDebounce.ts` — Debounce utility hook

---

### Phase 10: Frontend — Shared Components

#### [NEW] src/components/
- `PodiumDisplay.tsx` — Visual podium with animated medals
- `RankBadge.tsx` — Gold/Silver/Bronze rank badges
- `AnimatedCounter.tsx` — Counter animation for stats
- `ScoreProgressBar.tsx` — Animated progress bar
- `RadarChart.tsx` — Recharts radar wrapper
- `AchievementBadge.tsx` — Achievement/badge display
- `EmptyState.tsx` — Beautiful empty states
- `LoadingSkeleton.tsx` — Skeleton loaders for each page type
- `SearchInput.tsx` — Global search component
- `ExportButton.tsx` — PDF/Excel export trigger
- `Toast notifications` — Via Shadcn's toast system

---

## Verification Plan

### Automated Tests
1. **Backend Build**: `dotnet build` — ensure solution compiles
2. **Backend Tests**: `dotnet test` — unit tests for services and validators
3. **Database Migration**: `dotnet ef database update` — ensure migrations apply
4. **Frontend Build**: `npm run build` — ensure TypeScript compiles with no errors
5. **API Swagger**: Launch API and verify Swagger UI loads at `/swagger`

### Manual Verification
1. Run backend with `dotnet run` — verify API responds at `https://localhost:7000`
2. Run frontend with `npm run dev` — verify UI loads at `http://localhost:5173`
3. Test public pages load with seed data
4. Test admin login → dashboard → CRUD operations
5. Test score editing and verify rankings update
6. Test dark mode toggle
7. Test responsive layout on different viewport sizes

---

## Execution Strategy

Given the massive scope, I will build in this order:

1. **Backend first** (Phases 1-4): Complete API with seed data
2. **Frontend setup** (Phase 5): Project scaffolding and design system
3. **Frontend layout** (Phase 6): Shared layout components
4. **Public pages** (Phase 7): All user-facing pages
5. **Admin pages** (Phase 8): All admin pages
6. **Services & hooks** (Phase 9): API integration layer
7. **Polish** (Phase 10): Shared components, animations, final styling

I will use **subagents** to parallelize backend and frontend work where possible.

Estimated file count: ~120+ files across backend and frontend.

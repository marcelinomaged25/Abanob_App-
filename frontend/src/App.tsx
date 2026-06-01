import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Public Pages
import { HomePage } from '@/pages/public/HomePage'
import { StandingsPage } from '@/pages/public/StandingsPage'
import { TeamProfilePage } from '@/pages/public/TeamProfilePage'
import { LeaderboardPage } from '@/pages/public/LeaderboardPage'
import { HallOfFamePage } from '@/pages/public/HallOfFamePage'
import { AnalyticsPage } from '@/pages/public/AnalyticsPage'

// Admin Pages
import { LoginPage } from '@/pages/admin/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { ManageSeasonsPage } from '@/pages/admin/ManageSeasonsPage'
import { ManageTeamsPage } from '@/pages/admin/ManageTeamsPage'
import { ManageCategoriesPage } from '@/pages/admin/ManageCategoriesPage'
import { ManageScoresPage } from '@/pages/admin/ManageScoresPage'
import { ManageMemberScoresPage } from '@/pages/admin/ManageMemberScoresPage'
import { AuditLogsPage } from '@/pages/admin/AuditLogsPage'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/team/:id" element={<TeamProfilePage />} />
        <Route path="/live" element={<LeaderboardPage />} />
        <Route path="/hall-of-fame" element={<HallOfFamePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/seasons" element={<ManageSeasonsPage />} />
        <Route path="/admin/teams" element={<ManageTeamsPage />} />
        <Route path="/admin/categories" element={<ManageCategoriesPage />} />
        <Route path="/admin/scores" element={<ManageScoresPage />} />
        <Route path="/admin/member-scores" element={<ManageMemberScoresPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  )
}

export default App

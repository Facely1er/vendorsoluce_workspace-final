import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { IntakePage } from '../pages/IntakePage'
import { VendorsPage } from '../pages/VendorsPage'
import { RisksPage } from '../pages/RisksPage'
import { EvidencePage } from '../pages/EvidencePage'
import { ActionsPage } from '../pages/ActionsPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ThemeSync } from './theme/ThemeSync'

export function App() {
  return (
    <>
      <ThemeSync />
      <Routes>
        <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/risks" element={<RisksPage />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}


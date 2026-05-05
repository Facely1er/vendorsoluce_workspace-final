import { NavLink, Outlet } from 'react-router-dom'
import { useMemo } from 'react'
import { useWorkspaceStats } from '../../store/useWorkspaceStats'

const navItems: Array<{ to: string; label: string }> = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/intake', label: 'Vendor Intake' },
  { to: '/vendors', label: 'Vendors' },
  { to: '/risks', label: 'Vendor Risks' },
  { to: '/evidence', label: 'Vendor Evidence' },
  { to: '/actions', label: 'Vendor Actions' },
  { to: '/reports', label: 'Vendor Reports' },
  { to: '/settings', label: 'Settings' },
]

export function AppLayout() {
  const stats = useWorkspaceStats()
  const badge = useMemo(() => {
    const openRisks = stats.risks.open
    const missingEvidence = stats.evidence.missingRequired
    return { openRisks, missingEvidence }
  }, [stats])

  return (
    <div className="ws-shell">
      <aside className="ws-sidebar">
        <div className="ws-brand">
          <img className="ws-brand-logo" src="/vendorsoluce.png" alt="VendorSoluce logo" />
          <div className="ws-brand-text">
            <div className="ws-brand-name">VendorSoluce</div>
            <div className="ws-brand-tagline">Vendor Risk Workspace</div>
          </div>
        </div>

        <nav className="ws-nav" aria-label="Primary">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                ['ws-nav-link', isActive ? 'active' : ''].filter(Boolean).join(' ')
              }
              end
            >
              <span>{it.label}</span>
              {it.to === '/risks' && badge.openRisks > 0 ? (
                <span className="ws-nav-pill">{badge.openRisks}</span>
              ) : null}
              {it.to === '/evidence' && badge.missingEvidence > 0 ? (
                <span className="ws-nav-pill warn">{badge.missingEvidence}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="ws-sidebar-footer small">
          <div>Local-only workspace</div>
          <div className="small">No backend • No auth</div>
        </div>
      </aside>

      <div className="ws-main">
        <header className="ws-topbar">
          <div className="ws-topbar-title">VendorSoluce Workspace</div>
          <div className="ws-topbar-meta small">
            <span>{stats.vendors.total} vendors</span>
            <span className="ws-dot" aria-hidden="true" />
            <span>{stats.evidence.coveragePct}% evidence coverage</span>
            <span className="ws-dot" aria-hidden="true" />
            <span>{stats.score} vendor readiness</span>
          </div>
        </header>
        <main className="ws-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageLoader from './components/common/PageLoader';
import NotFoundPage from './pages/public/NotFoundPage';
import AppChrome from './app/AppChrome';
import AppProviders from './app/AppProviders';
import { AuthRoutes } from './app/routes/authRoutes';
import { PublicRoutes } from './app/routes/publicRoutes';
import { WorkspaceRoutes } from './app/routes/workspaceRoutes';

function App() {
  return (
    <AppProviders>
      <Router>
        <AppChrome>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <AuthRoutes />
              <PublicRoutes />
              <WorkspaceRoutes />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AppChrome>
      </Router>
    </AppProviders>
  );
}

export default App;

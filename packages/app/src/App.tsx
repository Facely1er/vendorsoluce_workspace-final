import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageLoader from './components/common/PageLoader';
import NotFoundPage from './pages/public/NotFoundPage';
import AppChrome from './app/AppChrome';
import AppProviders from './app/AppProviders';
import { authRoutes } from './app/routes/authRoutes';
import { publicRoutes } from './app/routes/publicRoutes';
import { workspaceRoutes } from './app/routes/workspaceRoutes';

function App() {
  return (
    <Router>
      <AppProviders>
        <AppChrome>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {authRoutes}
              {publicRoutes}
              {workspaceRoutes}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AppChrome>
      </AppProviders>
    </Router>
  );
}

export default App;

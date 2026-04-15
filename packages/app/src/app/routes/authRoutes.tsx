import React from 'react';
import { AR } from 'shared/constants/routes';
import { Route } from 'react-router-dom';
import SignInPage from '../../pages/auth/SignInPage';
import ErmitsAuthCallbackPage from '../../pages/auth/ErmitsAuthCallbackPage';
import ErmitsUpgradePage from '../../pages/auth/ErmitsUpgradePage';

export const authRoutes = (
  <>
    <Route path={AR.SIGNIN} element={<SignInPage />} />
    <Route path={AR.SIGNUP} element={<SignInPage />} />
    <Route path={AR.CALLBACK} element={<ErmitsAuthCallbackPage />} />
    <Route path={AR.UPGRADE} element={<ErmitsUpgradePage />} />
  </>
);

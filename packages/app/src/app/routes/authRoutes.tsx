import React from 'react';
import { AR } from 'shared/constants/routes';
import { Route } from 'react-router-dom';
import SignInPage from '../../pages/auth/SignInPage';

export function AuthRoutes() {
  return (
    <>
      <Route path={AR.SIGNIN} element={<SignInPage />} />
      <Route path={AR.SIGNUP} element={<SignInPage />} />
    </>
  );
}

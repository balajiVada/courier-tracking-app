import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import AuthLayout from './components/layout/AuthLayout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import LandingPage from './pages/LandingPage';
import PlaceOrderPage from './pages/PlaceOrderPage';

import MainLayout from './components/layout/MainLayout';
import TrackOrderPage from './pages/TrackOrderPage';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import OrderUpdatePage from './pages/OrderUpdatePage';


const ProtectedRoute = ({ children }) => {
  const { user, setUser } = useAuth();

  if (!user && !localStorage.getItem("user_id")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AuthLayout />} >
            <Route path='/login' element={<Login />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path='/signup' element={<Signup />} />
          </Route>
          <Route element={<AuthLayout />} >
            <Route path='/forgotpassword' element={<ForgotPassword />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path='/resetpassword' element={<ResetPassword />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path='/landingpage' element={<LandingPage />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path='/placeorderpage/' element={<ProtectedRoute><PlaceOrderPage /></ProtectedRoute>} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path='/trackorderpage' element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path='/trackorderpage/:trackingId' element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path='/userprofile' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path='/adminprofile' element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path='/orderupdatepage' element={<ProtectedRoute><OrderUpdatePage /></ProtectedRoute>} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/orderupdatepage/:trackingId" element={<OrderUpdatePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/landingpage" replace />} />
          <Route path="*" element={<Navigate to="/landingpage" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
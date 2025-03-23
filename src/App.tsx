import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HospitalLogin from "./pages/HospitalLogin";
import DonorLogin from "./pages/DonorLogin";
import Signup from "./pages/Signup";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const ProtectedRoute = ({ children, userType = "donor" }: { children: React.ReactNode, userType?: "donor" | "hospital" }) => {
  const { session } = useAuth();
  if (!session) return <Navigate to={userType === "donor" ? "/donor/login" : "/hospital/login"} />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/donor/login" element={<DonorLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute userType="donor">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute userType="hospital">
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
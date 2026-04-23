import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthCallback } from "./components/AuthCallback";
import { Landing } from "./components/Landing";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";
import { Loader2 } from "lucide-react";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If user data was passed from AuthCallback, render immediately
  if (location.state?.user) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Router - handles OAuth callback synchronously
const AppRouter = () => {
  const location = useLocation();

  // Check URL fragment for session_id synchronously during render
  // This prevents race conditions by processing new session_id FIRST
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

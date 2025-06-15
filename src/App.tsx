
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import ClaimantDashboard from "./components/dashboard/ClaimantDashboard";
import MediatorDashboard from "./components/dashboard/MediatorDashboard";
import RespondentDashboard from "./components/dashboard/RespondentDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import NewCasePage from "./pages/NewCasePage";
import JoinCasePage from "./pages/JoinCasePage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/join-case" element={<JoinCasePage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/case/new" element={
              <ProtectedRoute>
                <NewCasePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="claimant" replace />} />
              <Route path="claimant" element={<ClaimantDashboard />} />
              <Route path="respondent" element={<RespondentDashboard />} />
              <Route path="mediator" element={<MediatorDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

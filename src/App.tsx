
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardConfigProvider } from "@/contexts/DashboardConfigContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseView from "./pages/CourseView";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import ExpertProfile from "./pages/expert/ExpertProfile";
import ExpertContributions from "./pages/expert/ExpertContributions";
import UserManagement from "./pages/admin/UserManagement";
import CompanyManagement from "./pages/admin/CompanyManagement";
import CompanyBranding from "./pages/admin/CompanyBranding";
import CourseManagement from "./pages/admin/CourseManagement";
import DocumentManagement from "./pages/admin/DocumentManagement";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <DashboardConfigProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:id" element={<CourseView />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
                  {/* Expert Routes */}
                  <Route path="/expert/profile" element={<ExpertProfile />} />
                  <Route path="/expert/contributions" element={<ExpertContributions />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/companies" element={<CompanyManagement />} />
                  <Route path="/admin/company/:companyId/branding" element={<CompanyBranding />} />
                  <Route path="/admin/courses" element={<CourseManagement />} />
                  <Route path="/admin/documents" element={<DocumentManagement />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/settings" element={<Settings />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardConfigProvider>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;

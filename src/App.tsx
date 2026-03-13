import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CollegeBattle from "./pages/CollegeBattle";
import Deadlines from "./pages/Deadlines";
import Scholarships from "./pages/Scholarships";
import Cutoffs from "./pages/Cutoffs";
import CareerDNA from "./pages/CareerDNA";
import DreamReality from "./pages/DreamReality";
import CourseFit from "./pages/CourseFitNew";
import Placements from "./pages/Placements";
import MockTests from "./pages/MockTests";
import NotFound from "./pages/NotFound";
import CollegePredictor from "./pages/CollegePredictor";
import RankPredictor from "./pages/RankPredictor";
import ExamCollegePredictor from "./pages/ExamCollegePredictor";
import ExamRankPredictor from "./pages/ExamRankPredictor";
import ComingSoon from "./pages/ComingSoon";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LeadForm from "./pages/LeadForm";
import { AuthProvider } from "./contexts/AuthContext";

// Code-split admin routes to reduce main bundle size
const Admin = lazy(() => import("./pages/Admin"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Testing = lazy(() => import("./pages/Testing"));

// Loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
          <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/lander" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/college-battle" element={<CollegeBattle />} />
            <Route path="/deadlines" element={<Deadlines />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/cutoffs" element={<Cutoffs />} />
            <Route path="/career-dna" element={<CareerDNA />} />
            <Route path="/dream-reality" element={<DreamReality />} />
            <Route path="/course-fit" element={<CourseFit />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/mock-tests" element={<MockTests />} />
            <Route path="/college-predictor" element={<CollegePredictor />} />
            <Route path="/college-predictor/:examId" element={<ExamCollegePredictor />} />
            <Route path="/rank-predictor" element={<RankPredictor />} />
            <Route path="/rank-predictor/:examId" element={<ExamRankPredictor />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/get-in-touch" element={<LeadForm />} />
            <Route path="/blog" element={<ComingSoon />} />
            <Route path="/about" element={<ComingSoon />} />
            <Route path="/contact" element={<ComingSoon />} />
            <Route path="/exam-news" element={<ComingSoon />} />
          </Route>
          <Route path="/admin" element={
            <Suspense fallback={<PageLoader />}>
              <Admin />
            </Suspense>
          } />
          <Route path="/admin-panel" element={
            <Suspense fallback={<PageLoader />}>
              <AdminPanel />
            </Suspense>
          } />
          <Route path="/testing" element={
            <Suspense fallback={<PageLoader />}>
              <Testing />
            </Suspense>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

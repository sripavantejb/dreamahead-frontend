import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/authApi";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Trophy, 
  Calendar, 
  FileText, 
  Building2, 
  Users, 
  BarChart3,
  Menu,
  LogOut,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Import module components
import AdminDashboard from "@/components/admin/AdminDashboard";
import CourseFitCMS from "@/components/admin/CourseFitCMS";
import ScholarshipsCMS from "@/components/admin/ScholarshipsCMS";
import ExamCalendarCMS from "@/components/admin/ExamCalendarCMS";
import MockTestsCMS from "@/components/admin/MockTestsCMS";
import PapersCMS from "@/components/admin/PapersCMS";
import CollegesCMS from "@/components/admin/CollegesCMS";
import LeadsCMS from "@/components/admin/LeadsCMS";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import { SignupCollegesCMS } from "@/components/admin/SignupCollegesCMS";
import UsersCMS from "@/components/admin/UsersCMS";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isLoading, setUser } = useAuth();
  const [activeModule, setActiveModule] = useState("dashboard");
  const isAdmin = user?.role === "admin";

  const handleSignOut = () => {
    authApi.clearToken();
    setUser(null);
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "coursefit", label: "Course Fit Test", icon: GraduationCap },
    { id: "scholarships", label: "Scholarships", icon: Trophy },
    { id: "exams", label: "Exam Calendar", icon: Calendar },
    { id: "mocktests", label: "Mock Tests", icon: FileText },
    { id: "papers", label: "Previous Papers", icon: FileText },
    { id: "colleges", label: "Colleges", icon: Building2 },
    { id: "signupcolleges", label: "Colleges (Signup)", icon: UserPlus },
    { id: "leads", label: "Leads", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <UsersCMS />;
      case "coursefit":
        return <CourseFitCMS />;
      case "scholarships":
        return <ScholarshipsCMS />;
      case "exams":
        return <ExamCalendarCMS />;
      case "mocktests":
        return <MockTestsCMS />;
      case "papers":
        return <PapersCMS />;
      case "colleges":
        return <CollegesCMS />;
      case "signupcolleges":
        return <SignupCollegesCMS />;
      case "leads":
        return <LeadsCMS />;
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
        <p className="text-sm text-muted-foreground mt-1">Dream Ahead</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeModule === item.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveModule(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-semibold">Log in required</h2>
          <p className="text-muted-foreground">Please log in to access the admin panel.</p>
          <Button onClick={() => navigate("/login")}>Log in</Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-semibold">Admin access required</h2>
          <p className="text-muted-foreground">
            This panel is limited to authorized staff. Please contact your account owner to enable access.
          </p>
          <Button onClick={() => navigate("/")}>Back to home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 md:p-8">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;

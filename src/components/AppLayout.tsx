import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

export const AppLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

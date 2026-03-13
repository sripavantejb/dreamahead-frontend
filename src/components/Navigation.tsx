import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/authApi";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Menu, Compass, BarChart3 } from "lucide-react";
import { ExamIcon } from "@/components/ExamIcon";
import type { ExamIconKey } from "@/data/exams";
import { exams } from "@/data/exams";

const LOGO_URL = "https://res.cloudinary.com/dhucf8zqv/image/upload/v1773296092/Screenshot_2026-03-12_at_11.44.46_AM_qvgbtu.png";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAnonymous, isLoading, setUser } = useAuth();
  const displayName = user?.full_name?.trim() || user?.email || "Account";
  const navigate = useNavigate();

  const handleSignOut = () => {
    authApi.clearToken();
    setUser(null);
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const collegePredictorLinks = exams.map(exam => ({
    href: `/college-predictor/${exam.id}`,
    label: `${exam.name} College Predictor 2026`,
    iconKey: exam.iconKey,
  }));

  const rankPredictorLinks: { href: string; label: string; iconKey: ExamIconKey }[] = [
    { href: "/rank-predictor/jee-main-percentile", label: "JEE Main Percentile Predictor 2026", iconKey: "graduation" },
    { href: "/rank-predictor/jee-main", label: "JEE Main Rank Predictor 2026", iconKey: "graduation" },
    { href: "/rank-predictor/jee-advanced", label: "JEE Advanced Rank Predictor 2026", iconKey: "graduation" },
    ...exams.filter(e => !e.id.includes("jee")).map(exam => ({
      href: `/rank-predictor/${exam.id}`,
      label: `${exam.name} Rank Predictor 2026`,
      iconKey: exam.iconKey,
    })),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white text-foreground shadow-sm">
      <div className="max-w-6xl mx-auto min-h-14 h-16 flex items-center justify-between px-3 sm:px-6 gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded">
          <img
            src={LOGO_URL}
            alt="Dream Ahead"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-[180px] min-[400px]:max-w-[220px] sm:max-w-[260px] md:max-w-[300px]"
            width={300}
            height={56}
            loading="eager"
          />
        </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {/* Discover Yourself */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2 bg-transparent text-foreground hover:text-foreground hover:bg-muted focus:text-foreground focus:bg-transparent data-[state=open]:bg-muted data-[state=open]:text-foreground">
                    <Compass className="h-4 w-4" />
                    Discover Yourself
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink asChild>
                        <Link to="/career-dna" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                          <div className="text-sm font-medium leading-none">Career DNA Test</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Discover your personality-based career matches
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/course-fit" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                          <div className="text-sm font-medium leading-none">Course Fit Test</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Find your perfect academic stream
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a href="https://1pcclub.in/" target="_blank" rel="noopener noreferrer" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                          <div className="text-sm font-medium leading-none">Mock Tests</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Practice with expert-designed tests
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Predict Admission */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2 bg-transparent text-foreground hover:text-foreground hover:bg-muted focus:text-foreground focus:bg-transparent data-[state=open]:bg-muted data-[state=open]:text-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Predict Admission
                </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[500px]">
                      <div className="grid grid-cols-2 gap-3">
                        <NavigationMenuLink asChild>
                          <Link to="/college-predictor" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                            <div className="text-sm font-medium leading-none">College Predictor</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              See compatible colleges for your marks
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/rank-predictor" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                            <div className="text-sm font-medium leading-none">Rank Predictor</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Convert percentiles to actual ranks
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/college-battle" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                            <div className="text-sm font-medium leading-none">College Battle</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Compare colleges side-by-side
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/dream-reality" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                            <div className="text-sm font-medium leading-none">Dream vs Reality</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Find realistic alternatives
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <div className="border-t pt-3">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Exam-Specific Predictors</div>
                        <div className="grid grid-cols-2 gap-2">
                          {collegePredictorLinks.slice(0, 4).map((link) => (
                            <NavigationMenuLink key={link.href} asChild>
                              <Link to={link.href} className="flex items-center gap-2 text-xs p-2 rounded hover:bg-primary hover:text-primary-foreground">
                                <ExamIcon iconKey={link.iconKey} className="h-4 w-4 shrink-0" />
                                {link.label}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center gap-6 pl-4 border-l border-border">
              {!isLoading && (
                isAnonymous ? (
                  <>
                    <Link
                      to="/login"
                      className="relative text-sm font-medium text-foreground py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-foreground after:transition-[width] after:duration-200 hover:text-foreground hover:after:w-full"
                    >
                      Log in
                    </Link>
                    <Button asChild size="default" className="rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-300">
                      <Link to="/signup">Sign up</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]" title={displayName}>
                      {displayName}
                    </span>
                    <Link
                      to="/dashboard"
                      className="relative text-sm font-medium text-foreground py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-foreground after:transition-[width] after:duration-200 hover:text-foreground hover:after:w-full"
                    >
                      Dashboard
                    </Link>
                    <Button type="button" size="default" variant="outline" className="rounded-lg font-medium border-border text-foreground hover:bg-muted" onClick={handleSignOut}>
                      Log out
                    </Button>
                  </>
                )
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="bg-transparent text-foreground hover:text-foreground hover:bg-muted">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <img
                      src={LOGO_URL}
                      alt="Dream Ahead"
                      className="h-12 w-auto object-contain max-w-[240px]"
                      width={240}
                      height={48}
                    />
                  </Link>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="discover">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Compass className="h-4 w-4" />
                        Discover Yourself
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2 pl-4">
                          <Link to="/career-dna" className="text-sm py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Career DNA Test</Link>
                          <Link to="/course-fit" className="text-sm py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Course Fit Test</Link>
                          <a href="https://1pcclub.in/" target="_blank" rel="noopener noreferrer" className="text-sm py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Mock Tests</a>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="predict">
                      <AccordionTrigger className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Predict Admission
                    </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2 pl-4">
                          <Link to="/college-predictor" className="text-sm py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>College Predictor</Link>
                          <Link to="/rank-predictor" className="text-sm py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Rank Predictor</Link>
                          <Link to="/college-battle" className="text-sm py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>College Battle</Link>
                          <Link to="/dream-reality" className="text-sm py-2 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Dream vs Reality</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                  </Accordion>
                  
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    {!isLoading && (
                      isAnonymous ? (
                        <>
                          <Link to="/login" className="text-sm font-medium py-2 hover:text-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>
                            Log in
                          </Link>
                          <Button asChild className="w-full rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-muted-foreground py-2 text-center border-b border-border pb-3">
                            {displayName}
                          </p>
                          <Link to="/dashboard" className="text-sm font-medium py-2 hover:text-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>
                            Dashboard
                          </Link>
                          <Button type="button" variant="outline" className="w-full rounded-lg font-medium" onClick={handleSignOut}>
                            Log out
                          </Button>
                        </>
                      )
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
      </div>
    </nav>
  );
};
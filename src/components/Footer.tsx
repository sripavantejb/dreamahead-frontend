import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Instagram, Youtube, Linkedin } from "lucide-react";
import { exams } from "@/data/exams";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { name: "Career DNA Test", path: "/career-dna" },
    { name: "Course Fit Test", path: "/course-fit" },
    { name: "College Predictor", path: "/college-predictor" },
    { name: "Rank Predictor", path: "/rank-predictor" },
    { name: "College Comparison", path: "/college-battle" },
    { name: "Dream 5 vs Reality 5", path: "/dream-reality" },
    { name: "Deadline Tracker", path: "/deadlines" },
    { name: "Scholarship Finder", path: "/scholarships" },
    { name: "Placement Reality Checker", path: "/placements" },
    { name: "Mock Tests", path: "/mock-tests" }
  ];

  const rankPredictorLinks = [
    { name: "JEE Main Percentile Predictor 2026", path: "/rank-predictor/jee-main-percentile" },
    { name: "JEE Main Rank Predictor 2026", path: "/rank-predictor/jee-main" },
    { name: "JEE Advanced Rank Predictor 2026", path: "/rank-predictor/jee-advanced" },
    ...exams.filter(e => !e.id.includes("jee")).map(exam => ({
      name: `${exam.name} Rank Predictor 2026`,
      path: `/rank-predictor/${exam.id}`
    }))
  ];

  const collegePredictorLinks = exams.map(exam => ({
    name: `${exam.name} College Predictor 2026`,
    path: `/college-predictor/${exam.id}`
  }));

  return (
    <footer className="bg-primary border-t border-primary-foreground/20 mt-auto text-primary-foreground">
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-14 md:py-16">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 mb-10">
          {/* Column 1: About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-6">About</h3>
            <p className="text-sm text-primary-foreground/90 mb-4 leading-relaxed">
              Empowering students with data, clarity, and guidance.
            </p>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Dream Ahead helps students across India navigate college admissions with confidence — from predictions to scholarships to deadlines.
            </p>
          </div>

          {/* Column 2: Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-6">Tools</h3>
            <ul className="space-y-3">
              {exploreLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Exam Predictors */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-6">Exam Predictors</h3>
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {collegePredictorLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              {rankPredictorLinks.slice(0, 3).map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-xs text-primary-foreground/80 mt-4 pt-4 border-t border-primary-foreground/20">
              JEE • EAMCET • KCET • MHT CET • TNEA • KEAM • WBJEE
            </p>
          </div>

          {/* Column 4: Community */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-6">Community</h3>
            <div className="space-y-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start gap-2 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/20"
                onClick={() => window.open("https://wa.me/919999999999", "_blank")}
              >
                <MessageCircle className="h-4 w-4" />
                Join WhatsApp
              </Button>
              <div className="flex gap-3">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all flex items-center justify-center"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all flex items-center justify-center"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all flex items-center justify-center"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
              <p className="text-xs text-primary-foreground/90">
                Email: <a href="mailto:support@collegecompanionhub.in" className="text-primary-foreground hover:underline">support@collegecompanionhub.in</a>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Accordions */}
        <div className="md:hidden mb-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about" className="border-primary-foreground/20">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90 hover:text-primary-foreground">About</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-primary-foreground/90 mb-4 leading-relaxed">
                  Empowering students with data, clarity, and guidance.
                </p>
                <p className="text-sm text-primary-foreground/90 leading-relaxed">
                  Dream Ahead helps students across India navigate college admissions with confidence.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="explore" className="border-primary-foreground/20">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90 hover:text-primary-foreground">Tools</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {exploreLinks.map(link => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors block py-1">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="predictors" className="border-primary-foreground/20">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90 hover:text-primary-foreground">Exam Predictors</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {collegePredictorLinks.map(link => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors block py-1">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  {rankPredictorLinks.slice(0, 3).map(link => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors block py-1">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-primary-foreground/80 mt-4 pt-4 border-t border-primary-foreground/20">
                  JEE • EAMCET • KCET • MHT CET • TNEA • KEAM • WBJEE
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="connect" className="border-primary-foreground/20">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90 hover:text-primary-foreground">Community</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/20"
                    onClick={() => window.open("https://wa.me/919999999999", "_blank")}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Join WhatsApp
                  </Button>
                  <div className="flex gap-3">
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all flex items-center justify-center"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://youtube.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all flex items-center justify-center"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all flex items-center justify-center"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                  <p className="text-xs text-primary-foreground/90">
                    Email: <a href="mailto:support@collegecompanionhub.in" className="text-primary-foreground hover:underline">support@collegecompanionhub.in</a>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-primary-foreground/80">
              © {currentYear} Dream Ahead. All rights reserved.
            </div>
            <div className="font-medium text-primary-foreground">
              Built by expert mentors and trusted by students across India.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-primary-foreground/80">
              <Link to="/get-in-touch" className="hover:text-primary-foreground transition-colors">Get in touch</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/refund" className="hover:text-primary-foreground transition-colors">Refund</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

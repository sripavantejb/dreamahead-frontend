import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { exams } from "@/data/exams";
import { ExamIcon } from "@/components/ExamIcon";
import { TrendingUp, Sparkles } from "lucide-react";

const CollegePredictor = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">College Predictor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Find Your Perfect College Match
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Enter your rank or marks to discover colleges where you have the best chances of admission. Choose your exam below to get started.
            </p>
          </div>
        </section>

        {/* Exam Cards */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Select Your Exam</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <Card
                  key={exam.id}
                  className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
                  onClick={() => navigate(`/college-predictor/${exam.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <ExamIcon iconKey={exam.iconKey} className="h-8 w-8 shrink-0 text-primary" />
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {exam.fullName}
                        </CardTitle>
                        {exam.state && (
                          <p className="text-xs text-muted-foreground mt-1">{exam.state}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Check college predictions for 2026
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Pan-India Coverage:</span> AP • TS • KA • MH • TN • KL • WB & National Exams
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CollegePredictor;

import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { exams } from "@/data/exams";
import { ExamIcon } from "@/components/ExamIcon";
import type { ExamIconKey } from "@/data/exams";
import { Target, Sparkles } from "lucide-react";

const RankPredictor = () => {
  const navigate = useNavigate();

  const rankPredictorExams: { id: string; name: string; state?: string; iconKey: ExamIconKey }[] = [
    { id: "jee-main-percentile", name: "JEE Main Percentile Predictor", state: "National", iconKey: "graduation" },
    ...exams,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-secondary/10 via-background to-primary/10">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Target className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Rank Predictor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Predict Your Rank Accurately
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Get an estimated rank based on your exam performance. Our AI-powered predictors use historical data to give you the most accurate results.
            </p>
          </div>
        </section>

        {/* Exam Cards */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Select Your Exam</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankPredictorExams.map((exam) => (
                <Card
                  key={exam.id}
                  className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
                  onClick={() => navigate(`/rank-predictor/${exam.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <ExamIcon iconKey={exam.iconKey} className="h-8 w-8 shrink-0 text-secondary" />
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {exam.name}
                        </CardTitle>
                        {exam.state && (
                          <p className="text-xs text-muted-foreground mt-1">{exam.state}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      Calculate your predicted rank for 2026
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

export default RankPredictor;

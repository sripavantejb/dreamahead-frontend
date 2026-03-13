import { Footer } from "@/components/Footer";
import { ToolLanding } from "@/components/ToolLanding";
import { useParams, useNavigate } from "react-router-dom";
import { exams } from "@/data/exams";
import { TrendingUp, Target, Building2, Filter, BarChart } from "lucide-react";

const ExamCollegePredictor = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = exams.find(e => e.id === examId);

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Exam not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <ToolLanding
          icon={TrendingUp}
          title={`${exam.name} College Predictor 2026`}
          subtitle={`Find your perfect college match based on your ${exam.name} rank`}
          description="Get accurate predictions for admission chances across top engineering colleges in India. Our AI-powered predictor uses historical data and current trends."
          gradient="from-primary to-cyan-500"
          benefits={[
            {
              icon: Target,
              title: "Accurate Predictions",
              description: `Predict colleges based on your ${exam.name} rank with high accuracy`
            },
            {
              icon: BarChart,
              title: "Admission Probability",
              description: "Get admission probability percentage for each college"
            },
            {
              icon: Building2,
              title: "Compare Colleges",
              description: "Compare colleges side-by-side to make informed decisions"
            },
            {
              icon: Filter,
              title: "Smart Filters",
              description: "Filter by branch, location, fees, and more preferences"
            }
          ]}
          onStart={() => navigate("/college-predictor")}
        />
      </main>

      <Footer />
    </div>
  );
};

export default ExamCollegePredictor;

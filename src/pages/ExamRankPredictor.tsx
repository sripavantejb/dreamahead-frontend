import { Footer } from "@/components/Footer";
import { ToolLanding } from "@/components/ToolLanding";
import { useParams, useNavigate } from "react-router-dom";
import { exams } from "@/data/exams";
import { Target, TrendingUp, Users, Calculator, Building2 } from "lucide-react";

const ExamRankPredictor = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // Special handling for JEE Main percentile
  if (examId === "jee-main-percentile") {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <ToolLanding
            icon={Calculator}
            title="JEE Main Percentile Predictor 2026"
            subtitle="Calculate your JEE Main percentile from marks"
            description="Get accurate percentile predictions using historical data and trends. Compare across different sessions and understand your standing."
            gradient="from-secondary to-purple-500"
            benefits={[
              {
                icon: Calculator,
                title: "Marks to Percentile",
                description: "Calculate percentile from your expected or actual marks"
              },
              {
                icon: TrendingUp,
                title: "Session Comparison",
                description: "Compare your performance across different JEE Main sessions"
              },
              {
                icon: Users,
                title: "Rank Correlation",
                description: "View percentile vs rank correlation and understand your position"
              },
              {
                icon: Building2,
                title: "College Suggestions",
                description: "Get personalized college recommendations based on percentile"
              }
            ]}
            onStart={() => navigate("/rank-predictor")}
          />
        </main>

        <Footer />
      </div>
    );
  }

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
          icon={Target}
          title={`${exam.name} Rank Predictor 2026`}
          subtitle={`Predict your ${exam.name} rank accurately`}
          description="Our AI-powered predictor uses years of historical data to give you the most accurate rank predictions. Make informed decisions about your college choices."
          gradient="from-secondary to-purple-500"
          benefits={[
            {
              icon: Calculator,
              title: "Accurate Calculation",
              description: `Calculate ${exam.name} rank from marks or percentile`
            },
            {
              icon: TrendingUp,
              title: "Trend Analysis",
              description: "View rank trends and historical data analysis"
            },
            {
              icon: Users,
              title: "Peer Comparison",
              description: "Compare your performance with other students"
            },
            {
              icon: Building2,
              title: "College Recommendations",
              description: "Get college suggestions based on your predicted rank"
            }
          ]}
          onStart={() => navigate("/rank-predictor")}
        />
      </main>

      <Footer />
    </div>
  );
};

export default ExamRankPredictor;

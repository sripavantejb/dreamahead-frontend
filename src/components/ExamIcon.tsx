import { GraduationCap, Building2, LucideIcon } from "lucide-react";
import type { ExamIconKey } from "@/data/exams";

const examIconMap: Record<ExamIconKey, LucideIcon> = {
  graduation: GraduationCap,
  building: Building2,
};

interface ExamIconProps {
  iconKey: ExamIconKey;
  className?: string;
}

export function ExamIcon({ iconKey, className }: ExamIconProps) {
  const Icon = examIconMap[iconKey];
  return Icon ? <Icon className={className} /> : null;
}

export { examIconMap };

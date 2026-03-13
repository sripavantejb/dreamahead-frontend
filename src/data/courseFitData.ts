// Course Fit Test Dataset
// In production, this would be loaded from Excel/Google Sheets

export interface Question {
  question_id: string;
  order: number;
  question_text: string;
  question_type: 'single' | 'text';
  options_ref: string;
  weight_group: string;
  ask_if_tag_contains?: string;
}

export interface Option {
  options_ref: string;
  option_id: string;
  label: string;
  weights: string; // Format: "Analytical:+2;Tech:+1"
}

export interface Trait {
  trait: string;
  psychometric_type: string;
}

export interface CourseRule {
  rule_id: string;
  when_traits_contains: string; // Boolean expression
  top_courses: string[];
  reasoning_text: string;
  next_step_tile: string;
}

export interface Course {
  course_id: string;
  name: string;
  stream: string;
  duration: string;
  entry_exam: string;
  avg_salary_lpa: number;
}

export const questions: Question[] = [
  {
    question_id: 'Q1',
    order: 1,
    question_text: 'What kind of situations make you feel energized?',
    question_type: 'single',
    options_ref: 'OPT_ENERGY',
    weight_group: 'foundational',
  },
  {
    question_id: 'Q2',
    order: 2,
    question_text: 'Which subjects or activities do you enjoy learning?',
    question_type: 'single',
    options_ref: 'OPT_SUBJECTS',
    weight_group: 'foundational',
  },
  {
    question_id: 'Q3',
    order: 3,
    question_text: 'How do you picture your ideal work-day?',
    question_type: 'single',
    options_ref: 'OPT_WORKDAY',
    weight_group: 'foundational',
  },
  {
    question_id: 'Q4',
    order: 4,
    question_text: "What's your core strength?",
    question_type: 'single',
    options_ref: 'OPT_STRENGTH',
    weight_group: 'foundational',
  },
  {
    question_id: 'Q5',
    order: 5,
    question_text: 'Do you prefer working with:',
    question_type: 'single',
    options_ref: 'OPT_INTERACTION',
    weight_group: 'foundational',
  },
  {
    question_id: 'Q6',
    order: 6,
    question_text: 'If you could solve one problem in India, what would it be?',
    question_type: 'single',
    options_ref: 'OPT_IMPACT',
    weight_group: 'foundational',
  },
  {
    question_id: 'Q7',
    order: 7,
    question_text: 'What excites you most about tech?',
    question_type: 'single',
    options_ref: 'OPT_TECH_INTEREST',
    weight_group: 'tech_aware',
    ask_if_tag_contains: 'Tech',
  },
  {
    question_id: 'Q8',
    order: 8,
    question_text: 'Have you ever built something (app, website, automation)?',
    question_type: 'text',
    options_ref: 'TEXT_INPUT',
    weight_group: 'tech_aware',
    ask_if_tag_contains: 'Tech',
  },
];

export const options: Option[] = [
  // Energy options
  { options_ref: 'OPT_ENERGY', option_id: 'E1', label: 'Solving complex problems', weights: 'Analytical:+3;Tech:+2' },
  { options_ref: 'OPT_ENERGY', option_id: 'E2', label: 'Creating something new', weights: 'Creative:+3;Design:+2' },
  { options_ref: 'OPT_ENERGY', option_id: 'E3', label: 'Helping people', weights: 'People:+3;Social:+2' },
  { options_ref: 'OPT_ENERGY', option_id: 'E4', label: 'Building and managing', weights: 'Business:+3;Leadership:+2' },

  // Subjects options
  { options_ref: 'OPT_SUBJECTS', option_id: 'S1', label: 'Mathematics and logic', weights: 'Analytical:+3;Tech:+2' },
  { options_ref: 'OPT_SUBJECTS', option_id: 'S2', label: 'Arts and design', weights: 'Creative:+3;Design:+3' },
  { options_ref: 'OPT_SUBJECTS', option_id: 'S3', label: 'Science and research', weights: 'Analytical:+2;Research:+3' },
  { options_ref: 'OPT_SUBJECTS', option_id: 'S4', label: 'Business and economics', weights: 'Business:+3;Analytical:+1' },

  // Workday options
  { options_ref: 'OPT_WORKDAY', option_id: 'W1', label: 'Deep focus, solving hard problems', weights: 'Analytical:+2;Tech:+2' },
  { options_ref: 'OPT_WORKDAY', option_id: 'W2', label: 'Creating and designing', weights: 'Creative:+3;Design:+2' },
  { options_ref: 'OPT_WORKDAY', option_id: 'W3', label: 'Collaborating with teams', weights: 'People:+2;Business:+1' },
  { options_ref: 'OPT_WORKDAY', option_id: 'W4', label: 'Leading and managing', weights: 'Leadership:+3;Business:+2' },

  // Strength options
  { options_ref: 'OPT_STRENGTH', option_id: 'ST1', label: 'Analytical thinking', weights: 'Analytical:+3;Tech:+1' },
  { options_ref: 'OPT_STRENGTH', option_id: 'ST2', label: 'Creative expression', weights: 'Creative:+3;Design:+2' },
  { options_ref: 'OPT_STRENGTH', option_id: 'ST3', label: 'Communication', weights: 'People:+3;Social:+2' },
  { options_ref: 'OPT_STRENGTH', option_id: 'ST4', label: 'Technical skills', weights: 'Tech:+3;Analytical:+1' },

  // Interaction options
  { options_ref: 'OPT_INTERACTION', option_id: 'I1', label: 'Systems, code, machines', weights: 'Tech:+3;Analytical:+2' },
  { options_ref: 'OPT_INTERACTION', option_id: 'I2', label: 'Data and analysis', weights: 'Analytical:+3;Tech:+1' },
  { options_ref: 'OPT_INTERACTION', option_id: 'I3', label: 'People and clients', weights: 'People:+3;Social:+2' },
  { options_ref: 'OPT_INTERACTION', option_id: 'I4', label: 'Creative media', weights: 'Creative:+3;Design:+2' },

  // Impact options
  { options_ref: 'OPT_IMPACT', option_id: 'IM1', label: 'Tech innovation', weights: 'Tech:+3;Analytical:+1' },
  { options_ref: 'OPT_IMPACT', option_id: 'IM2', label: 'Education access', weights: 'Social:+3;People:+2' },
  { options_ref: 'OPT_IMPACT', option_id: 'IM3', label: 'Business growth', weights: 'Business:+3;Leadership:+1' },
  { options_ref: 'OPT_IMPACT', option_id: 'IM4', label: 'Creative expression', weights: 'Creative:+3;Design:+2' },

  // Tech interest options
  { options_ref: 'OPT_TECH_INTEREST', option_id: 'TI1', label: 'Building apps and websites', weights: 'Tech:+3;Creative:+1' },
  { options_ref: 'OPT_TECH_INTEREST', option_id: 'TI2', label: 'AI and machine learning', weights: 'Tech:+3;Analytical:+2' },
  { options_ref: 'OPT_TECH_INTEREST', option_id: 'TI3', label: 'Solving logical puzzles', weights: 'Analytical:+3;Tech:+1' },
  { options_ref: 'OPT_TECH_INTEREST', option_id: 'TI4', label: 'Not sure yet', weights: 'Tech:+1' },
];

export const traits: Trait[] = [
  { trait: 'Analytical', psychometric_type: 'Analytical Builder' },
  { trait: 'Tech', psychometric_type: 'Technical Innovator' },
  { trait: 'Creative', psychometric_type: 'Creative Maker' },
  { trait: 'Design', psychometric_type: 'Design Thinker' },
  { trait: 'People', psychometric_type: 'People Connector' },
  { trait: 'Business', psychometric_type: 'Strategic Leader' },
];

export const courseRules: CourseRule[] = [
  {
    rule_id: 'R1',
    when_traits_contains: 'Tech >= 8 AND Analytical >= 6',
    top_courses: ['B.Tech CSE', 'B.Tech AI & ML', 'B.Sc Data Science'],
    reasoning_text: "You're an Analytical Builder — CSE, Data Science, or AI & ML suit your logical mindset.",
    next_step_tile: 'college-finder',
  },
  {
    rule_id: 'R2',
    when_traits_contains: 'Creative >= 8 AND Design >= 6',
    top_courses: ['B.Des', 'B.Sc Animation', 'UX/UI Design'],
    reasoning_text: "You're more creative and people-focused — Design + Tech (UI/UX) could be your sweet spot.",
    next_step_tile: 'college-finder',
  },
  {
    rule_id: 'R3',
    when_traits_contains: 'Tech >= 6 AND Creative >= 6',
    top_courses: ['B.Tech CSE + Design', 'UX/UI Engineering', 'Product Design'],
    reasoning_text: "You balance tech and creativity — consider hybrid fields like UX Engineering or Product Design.",
    next_step_tile: 'college-finder',
  },
  {
    rule_id: 'R4',
    when_traits_contains: 'Business >= 8 OR Leadership >= 6',
    top_courses: ['BBA', 'B.Com Business Analytics', 'BBA Tech Management'],
    reasoning_text: "You have strong business and leadership traits — Management or Business Analytics fit well.",
    next_step_tile: 'college-finder',
  },
  {
    rule_id: 'R5',
    when_traits_contains: 'People >= 8 OR Social >= 6',
    top_courses: ['BA Psychology', 'B.Sc Social Work', 'BA Media & Communication'],
    reasoning_text: "You connect well with people — consider Psychology, Social Work, or Communications.",
    next_step_tile: 'college-finder',
  },
];

export const courses: Course[] = [
  { course_id: 'C1', name: 'B.Tech CSE', stream: 'Engineering', duration: '4 years', entry_exam: 'JEE Main', avg_salary_lpa: 8 },
  { course_id: 'C2', name: 'B.Tech AI & ML', stream: 'Engineering', duration: '4 years', entry_exam: 'JEE Main', avg_salary_lpa: 10 },
  { course_id: 'C3', name: 'B.Sc Data Science', stream: 'Science', duration: '3 years', entry_exam: 'University Entrance', avg_salary_lpa: 7 },
  { course_id: 'C4', name: 'B.Des', stream: 'Design', duration: '4 years', entry_exam: 'UCEED/NIFT', avg_salary_lpa: 6 },
  { course_id: 'C5', name: 'BBA', stream: 'Management', duration: '3 years', entry_exam: 'University Entrance', avg_salary_lpa: 5 },
];

export const uiCopy = {
  intro_title: "Hey 👋, let's find courses that actually match you",
  intro_subtitle: "Not just what everyone else is doing",
  intro_cta: "Start Test",
  result_title: "Your Course Fit",
  result_cta_1: "See Colleges for Top Course",
  result_cta_2: "Talk to an Advisor",
  returning_greeting: "Welcome back 👋",
  returning_question: "Want to refine your fit or explore new fields?",
};

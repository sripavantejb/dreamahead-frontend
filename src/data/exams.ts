export type ExamIconKey = "graduation" | "building";

export interface Exam {
  id: string;
  name: string;
  fullName: string;
  iconKey: ExamIconKey;
  state?: string;
}

export const exams: Exam[] = [
  {
    id: "jee-main",
    name: "JEE Main",
    fullName: "JEE Main & Advanced",
    iconKey: "graduation",
    state: "National"
  },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    fullName: "JEE Advanced",
    iconKey: "graduation",
    state: "National"
  },
  {
    id: "ap-eamcet",
    name: "AP EAMCET",
    fullName: "AP EAMCET",
    iconKey: "building",
    state: "AP"
  },
  {
    id: "ts-eamcet",
    name: "TS EAMCET",
    fullName: "TS EAMCET",
    iconKey: "building",
    state: "TS"
  },
  {
    id: "kcet",
    name: "KCET",
    fullName: "KCET",
    iconKey: "building",
    state: "KA"
  },
  {
    id: "mht-cet",
    name: "MHT CET",
    fullName: "MHT CET",
    iconKey: "building",
    state: "MH"
  },
  {
    id: "tnea",
    name: "TNEA",
    fullName: "TNEA",
    iconKey: "building",
    state: "TN"
  },
  {
    id: "keam",
    name: "KEAM",
    fullName: "KEAM",
    iconKey: "building",
    state: "KL"
  },
  {
    id: "wbjee",
    name: "WBJEE",
    fullName: "WBJEE",
    iconKey: "building",
    state: "WB"
  }
];

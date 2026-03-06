export enum InterviewType {
  TECHNICAL = "technical",
  CODING = "coding",
  HR = "hr",
  APTITUDE = "aptitude",
  VIDEO_PRACTICE = "video_practice",
  COMMUNICATION = "communication",
  COMPANY_SPECIFIC = "company_specific",
  FUTURE_SELF = "future_self",
}

export enum Personality {
  FRIENDLY = "Friendly HR",
  STRICT = "Strict Tech Lead",
  FAST_PACED = "Fast-paced Startup Founder",
}

export enum Company {
  GOOGLE = "Google",
  AMAZON = "Amazon",
  TCS = "TCS",
  INFOSYS = "Infosys",
}

export enum Language {
  ENGLISH = "English",
  HINDI = "Hindi",
  TAMIL = "Tamil",
  PYTHON = "Python",
  JAVASCRIPT = "JavaScript",
  JAVA = "Java",
  CPP = "C++",
  CSHARP = "C#",
  GO = "Go",
  RUST = "Rust",
  SWIFT = "Swift",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface InterviewResult {
  id: number;
  user_id: number;
  type: string;
  role: string;
  language: string;
  difficulty: string;
  score: number;
  feedback: string;
  results_json: string;
  created_at: string;
  username?: string;
}

export interface LeaderboardEntry {
  user_id: number;
  username: string;
  interviews_count: number;
  average_score: number;
}

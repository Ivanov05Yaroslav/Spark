export type QuestionType = 'ONE_CHOICE' | 'MULTIPLE_CHOICE';

export interface ApiAnswer {
  content: string;
  isCorrect: boolean;
}

export interface ApiQuestion {
  type: QuestionType;
  content: string;
  points: number;
  answers: ApiAnswer[];
}

export interface CreateTestPayload {
  courseId: string;
  nusGroupId: string | null;
  courseModuleId: string | null;
  newModuleTitle: string | null;
  title: string;
  timeLimitMinutes: number;
  deadline: string | null;
  maxAttempts: number;
  isResultHidden: boolean;
  isAttemptHidden: boolean;
  isShowCorrectAnswers: boolean;
  isShuffleQuestions: boolean;
  isShuffleAnswers: boolean;
  isHidden: boolean;
  questions: ApiQuestion[];
}

export interface UIAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface UIQuestion {
  id: string;
  type: QuestionType;
  content: string;
  points: number;
  answers: UIAnswer[];
}

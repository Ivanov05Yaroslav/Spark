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

export interface ApiTestDetailResponse extends Omit<CreateTestPayload, 'newModuleTitle'> {
  id: string;
  courseId: string;
  creatorId: string;
  createdAt: string;
  questions: Array<{
    id: string;
    testId: string;
    type: 'ONE_CHOICE' | 'MULTIPLE_CHOICE';
    content: string;
    points: number;
    answers: Array<{
      id: string;
      questionId: string;
      content: string;
      isCorrect: boolean;
    }>;
  }>;
}

export interface SubmitTestAnswer {
  questionId: string;
  answerId: string;
}

export interface SubmitTestPayload {
  answers: SubmitTestAnswer[];
  duration: number;
}

export interface ApiTestAttempt {
  id: string;
  attemptNumber: number;
  submittedAt: string;
  duration: number;
  score: string;
  canReview: boolean;
}

export interface ApiTestAttemptsResponse {
  testTitle: string;
  maxAttempts: number;
  usedAttempts: number;
  attempts: ApiTestAttempt[];
}

export interface ReviewAnswer {
  id: string;
  content: string;
  isSelectedByStudent: boolean;
  isCorrect: boolean;
}

export interface ReviewQuestion {
  id: string;
  content: string;
  type: 'ONE_CHOICE' | 'MULTIPLE_CHOICE';
  maxPoints: number;
  earnedPoints: number;
  answers: ReviewAnswer[];
}

export interface TestAttemptReviewResponse {
  id: string;
  studentId: string;
  submittedAt: string;
  duration: number;
  totalScore: string;
  questions: ReviewQuestion[];
}

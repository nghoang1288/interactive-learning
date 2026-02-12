// ===== API Response Types =====
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// ===== User Types =====
export interface UserPublic {
    id: string;
    name: string;
    email: string;
}

// ===== Video Types =====
export interface VideoWithQuizzes {
    id: string;
    title: string;
    description: string | null;
    url: string;
    duration: number;
    authorId: string;
    author: { name: string };
    quizzes: QuizWithOptions[];
    createdAt: Date;
}

// ===== Quiz Types =====
export interface QuizWithOptions {
    id: string;
    timestamp: number;
    question: string;
    options: QuizOptionData[];
}

export interface QuizOptionData {
    id: string;
    text: string;
    isCorrect: boolean;
}

// ===== Progress Types =====
export interface LessonProgress {
    id: string;
    videoId: string;
    currentTime: number;
    completed: boolean;
    completedAt: Date | null;
    video: {
        title: string;
        duration: number;
        author: { name: string };
    };
}

// ===== Lesson Card =====
export interface LessonCard {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    author: { name: string };
    progress?: {
        currentTime: number;
        completed: boolean;
    } | null;
}

// ===== Stats Types =====
export interface ContentOverview {
    totalVideos: number;
    totalLearners: number;
    completionRate: number;
}

export interface VideoStats {
    videoId: string;
    title: string;
    learners: {
        id: string;
        name: string;
        progress: number;
        completed: boolean;
    }[];
    quizStats: {
        quizId: string;
        question: string;
        timestamp: number;
        correctRate: number;
        totalAttempts: number;
    }[];
}

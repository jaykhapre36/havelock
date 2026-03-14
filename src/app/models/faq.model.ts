export interface FaqQuestion {
  id: number;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: number;
  category: string;
  icon: string;
  questions: FaqQuestion[];
}

export type Course = {
  id: string;
  title: string;
  description: string;
  priceYd: string;
  authorAddress: string;
  owned: boolean;
  progress: number;
};

export type CourseDetail = Course & {
  content: string | null;
};

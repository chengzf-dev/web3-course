export type Course = {
  id: string;
  title: string;
  description: string;
  priceYd: string;
  authorAddress: string;
  onchainExists?: boolean;
  status?: string;
  owned: boolean;
  progress: number;
};

export type CourseDetail = Course & {
  content: string | null;
};

export type AuthorCourse = {
  id: string;
  title: string;
  description: string;
  priceYd: string;
  authorAddress: string;
  onchainExists?: boolean;
  status?: string;
};

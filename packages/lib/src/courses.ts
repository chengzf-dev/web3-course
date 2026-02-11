import courses from "./data/courses.seed.json";
import type { Course, CourseDetail } from "./types/course";

const courseList = courses as Course[];

export function getCourses(): Course[] {
  return courseList;
}

export function getCourseById(id: string): CourseDetail | null {
  const found = courseList.find((course) => course.id === id);
  if (!found) {
    return null;
  }

  return {
    ...found,
    content: found.owned
      ? "Course content unlocked. Explore modules, assignments, and community resources."
      : null
  };
}

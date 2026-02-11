import { SiteHeader } from "@chengzf-dev/web3-course-ui";
import { fetchCourses } from "@chengzf-dev/web3-course-lib";
import AuthorDashboardClient from "./page.client";
import type { AuthorCourse } from "../../../types/course";

export default async function AuthorDashboardPage() {
  let courses: AuthorCourse[] = [];
  let apiError = false;

  try {
    const apiCourses = await fetchCourses();
    courses = apiCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      priceYd: course.priceYd,
      authorAddress: course.authorAddress,
      status: course.status
    }));
  } catch {
    apiError = true;
  }

  return (
    <div>
      <SiteHeader />
      <AuthorDashboardClient courses={courses} apiError={apiError} />
    </div>
  );
}

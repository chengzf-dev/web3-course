import SiteHeader from "../../../components/site-header";
import { fetchCourses } from "../../../lib/api";
import AuthorDashboardClient from "./page.client";

export default async function AuthorDashboardPage() {
  let courses: Array<{
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    status?: string;
  }> = [];
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

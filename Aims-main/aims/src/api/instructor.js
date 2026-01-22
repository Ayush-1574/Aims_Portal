import api from "./axios";

export const offerCourseAPI = (course) =>
  api.post("/courses/offer", {
    courseCode: course.courseCode,
    title: course.title,
    dept: course.dept,
    year: course.year,
    ltp: course.ltp,
    category: course.category,
    session: course.session
  }).then(res => res.data);
 
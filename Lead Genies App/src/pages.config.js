import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import WeeklyEntry from './pages/WeeklyEntry';
import Assignments from './pages/Assignments';
import Wochenreporting from './pages/Wochenreporting';
import Courses from './pages/Courses';
import Progress from './pages/Progress';
import Admin from './pages/Admin';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Customers": Customers,
    "Employees": Employees,
    "WeeklyEntry": WeeklyEntry,
    "Assignments": Assignments,
    "Wochenreporting": Wochenreporting,
    "Courses": Courses,
    "Progress": Progress,
    "Admin": Admin,
    "CourseDetail": CourseDetail,
    "Lesson": Lesson,
    "Quiz": Quiz,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
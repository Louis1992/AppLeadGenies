import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import WeeklyEntry from './pages/WeeklyEntry';
import Assignments from './pages/Assignments';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Customers": Customers,
    "Employees": Employees,
    "WeeklyEntry": WeeklyEntry,
    "Assignments": Assignments,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AuthLayout from "../components/layout/AuthLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import ScrollToTop from "../pages/ScrollToTop";
import { useAuth } from "../core/contexts/AuthContext";
import PageLoader from "../components/constants/PageLoader";

// -------------------- Lazy Loaded Pages -------------------- //
// Public Pages
const Home = lazy(() => import("../pages/public/Home"));
const About = lazy(() => import("../pages/public/About"));
const Career = lazy(() => import("../pages/public/Career"));
const Blog = lazy(() => import("../pages/public/Blog"));
const Contact = lazy(() => import("../pages/public/Contact"));
const PrivacyPolicy = lazy(() => import("../pages/public/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/public/Terms"));
const Faq = lazy(() => import("../pages/public/FreqeuntlyAsked"));

// Auth Pages
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));

// Customer Pages
const RecentRequest = lazy(() => import("../pages/customer/RecentRequest"));
const CompletedRequest = lazy(() => import("../pages/customer/CompletedRequest"));
const RequestForm = lazy(() => import("../pages/customer/RequestForm"));
const CustomerSupport = lazy(() => import("../pages/customer/ContactSupport"));
const RequestSuccess = lazy(() => import("../pages/customer/RequestSuccess"));
const AllCustomerRequests = lazy(() => import("../pages/customer/AllCustomerRequest"));

// Engineer Pages
const AssignedJobs = lazy(() => import("../pages/engineer/AssignedJobs"));
const OngoingJobs = lazy(() => import("../pages/engineer/OngoingJobs"));
const CompletedJobs = lazy(() => import("../pages/engineer/CompletedJobs"));
const EngineerPayment = lazy(() => import("../pages/engineer/PaymentStatus"));
const EngineerSupport = lazy(() => import("../pages/engineer/ContactSupport"));
const Report = lazy(() => import("../pages/engineer/report/Report"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("../pages/admin/AdminAnalytics"));
const InspectionReport = lazy(() => import("../pages/admin/InspectionReport"));
const PaymentManagement = lazy(() => import("../pages/admin/PaymentManagement"));

// Superadmin Pages
const SuperAdminDashboard = lazy(() => import("../pages/superadmin/SuperAdminDashboard"));
const Manage = lazy(() => import("../pages/superadmin/Manage"));
const Customize = lazy(() => import("../pages/superadmin/customize/Customize"));
const Analytics = lazy(() => import("../pages/superadmin/Analytics"));
const InspectionReports = lazy(() => import("../pages/superadmin/InspectionReports"));
const PaymentManagements = lazy(() => import("../pages/superadmin/PaymentManagements"));

// 404
const NotFound = () => <div className="p-10 text-center text-red-500 text-2xl">404 | Page Not Found</div>;

// -------------------- Helper to render dashboard routes -------------------- //
const renderDashboardRoutes = (role, routes) => (
  <Route
    element={<ProtectedRoute isAllowed role={role} redirectTo="/login" />}
    path={`/${role}/dashboard`}
  >
    <Route element={<DashboardLayout role={role} />}>
      {routes.map(({ path, element, index }) => (
        <Route key={path || "index"} path={path} index={index} element={element} />
      ))}
    </Route>
  </Route>
);

const AppRoutes = () => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;

  // Dashboard route configs
  const dashboardRoutes = {
    customer: [
      { index: true, element: <RecentRequest /> },
      { path: "recent-request", element: <RecentRequest /> },
      { path: "all-request", element: <AllCustomerRequests /> },
      { path: "completed-request", element: <CompletedRequest /> },
      { path: "contact-support", element: <CustomerSupport /> },
    ],
    engineer: [
      { index: true, element: <AssignedJobs /> },
      { path: "assigned", element: <AssignedJobs /> },
      { path: "ongoing-job", element: <OngoingJobs /> },
      { path: "completed-job", element: <CompletedJobs /> },
      { path: "payment-status", element: <EngineerPayment /> },
      { path: "contact-support", element: <EngineerSupport /> },
      { path: "report/:id", element: <Report /> },
    ],
    admin: [
      { index: true, element: <AdminDashboard /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "inspection-report", element: <InspectionReport /> },
      { path: "payment-management", element: <PaymentManagement /> },
      { path: "report/:id", element: <Report /> },
    ],
    superadmin: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: "dashboard", element: <SuperAdminDashboard /> },
      { path: "manage-users", element: <Manage /> },
      { path: "customize", element: <Customize /> },
      { path: "analytics", element: <Analytics /> },
      { path: "inspection-report", element: <InspectionReports /> },
      { path: "payment-management", element: <PaymentManagements /> },
      { path: "report/:id", element: <Report /> },
    ],
  };

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader/>}>
        <Routes>
          {/* ---------------- Public Routes ---------------- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/careers" element={<Career />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<Faq />} />
          </Route>

          {/* ---------------- Auth Routes ---------------- */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to={`/${user?.role}/dashboard`} replace />} />
            <Route path="/signup" element={!isLoggedIn ? <Signup /> : <Navigate to={`/${user?.role}/dashboard`} replace />} />
          </Route>

          {/* ---------------- Protected Form Routes ---------------- */}
          <Route element={<ProtectedRoute isAllowed={isLoggedIn} />}>
            <Route path="/request" element={<RequestForm />} />
            <Route path="/success" element={<RequestSuccess />} />
          </Route>

          {/* ---------------- Dashboard Routes ---------------- */}
          {["customer", "engineer", "admin", "superadmin"].map((role) =>
            renderDashboardRoutes(role, dashboardRoutes[role])
          )}

          {/* ---------------- 404 ---------------- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;


import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ManagementRoute from "./components/ManagementRoute";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import Analytics from "./pages/Analytics";
import AIChat from "./pages/AIChat";
import CollectionTasks from "./pages/CollectionTasks";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ManagementReviews from "./pages/ManagementReviews";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import WasteReports from "./pages/WasteReports";
import WasteScanner from "./pages/WasteScanner";

function Guarded({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <Guarded>
              <UserLayout />
            </Guarded>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<AIChat />} />
          <Route path="/scanner" element={<WasteScanner />} />
          <Route path="/reports" element={<WasteReports />} />
          <Route path="/collections" element={<CollectionTasks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/management"
            element={
              <ManagementRoute>
                <ManagementReviews />
              </ManagementRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <Guarded>
              <AdminLayout />
            </Guarded>
          }
        >
          <Route path="overview" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

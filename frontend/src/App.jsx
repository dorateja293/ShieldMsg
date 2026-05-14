import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const ChatDashboard = lazy(() => import("./pages/ChatDashboard.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));

function App() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">Loading…</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatDashboard />} />
          <Route path="profile/:id?" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

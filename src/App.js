import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import { Timer, LayoutDashboard, Users, Receipt } from "lucide-react";
import useBillingStore from "./store/BillingStore";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import Transactions from "./pages/Transactions";
import PaymentPage from "./pages/Payment";

function AppContent() {
  const location = useLocation();
  const { fetchUsers, loading, error } = useBillingStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex">
        <Sidebar currentPath={location.pathname} />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard navigate={navigate} />} />
            <Route
              path="/dashboard"
              element={<Dashboard navigate={navigate} />}
            />
            <Route path="/users" element={<UsersPage navigate={navigate} />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppContent />} />
        <Route path="/payment/:userId" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

// Komponen-komponen kecil yang dipisah
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Timer className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Billing Warnet
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Sidebar({ currentPath }) {
  return (
    <div className="w-64 bg-white shadow-md min-h-screen p-4">
      <div className="space-y-2">
        <SidebarLink
          active={currentPath === "/" || currentPath === "/dashboard"}
          to="/dashboard"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
        />
        <SidebarLink
          active={currentPath === "/users"}
          to="/users"
          icon={<Users className="h-5 w-5" />}
          label="Users"
        />
        <SidebarLink
          active={currentPath === "/transactions"}
          to="/transactions"
          icon={<Receipt className="h-5 w-5" />}
          label="Transactions"
        />
      </div>
    </div>
  );
}

function SidebarLink({ active, to, icon, label }) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
        active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default App;

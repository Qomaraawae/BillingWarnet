import React, { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import {
  Timer,
  LayoutDashboard,
  Users,
  Receipt,
  LogOut,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import useBillingStore from "./store/BillingStore";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import Transactions from "./pages/Transactions";
import PaymentPage from "./pages/Payment";
import AdminLogin from "./components/AdminLogin";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

// Komponen untuk proteksi route dengan animasi
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <motion.div
          animate={{
            rotate: 360,
            transition: {
              repeat: Infinity,
              duration: 1,
              ease: "linear",
            },
          }}
          className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  return user ? children : <Navigate to="/admin/login" replace />;
}

function AppContent() {
  const location = useLocation();
  const { fetchUsers, loading, error } = useBillingStore();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showNotification = useCallback((message, type) => {
    setNotification({
      show: true,
      message,
      type,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      setAuthLoading(false);

      if (user) {
        showNotification("Login berhasil!", "success");
        const timer = setTimeout(hideNotification, 2000);
        return () => clearTimeout(timer);
      }
    });
    return () => unsubscribe();
  }, [showNotification, hideNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification(
        "Logout berhasil! Mengarahkan ke halaman login...",
        "info"
      );
      const timer = setTimeout(() => {
        navigate("/admin/login");
        hideNotification();
      }, 1500);
      return () => clearTimeout(timer);
    } catch (error) {
      showNotification(`Gagal logout: ${error.message}`, "error");
      const timer = setTimeout(hideNotification, 3000);
      return () => clearTimeout(timer);
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="flex">
        {isAdmin && <Sidebar currentPath={location.pathname} />}
        <main className={`${isAdmin ? "flex-1 p-8" : "w-full p-8"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    isAdmin ? (
                      <Dashboard navigate={navigate} />
                    ) : (
                      <Navigate to="/admin/login" replace />
                    )
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard navigate={navigate} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UsersPage navigate={navigate} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <Transactions />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Notifikasi Global */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.type === "success" && (
              <CheckCircle className="h-5 w-5" />
            )}
            {notification.type === "error" && <X className="h-5 w-5" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/*" element={<AppContent />} />
        <Route
          path="/payment/:userId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Komponen NavBar dengan animasi dan konfirmasi logout
function NavBar({ isAdmin, onLogout }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await onLogout();
    setIsLoggingOut(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2"
          >
            <Timer className="h-8 w-8 text-blue-600" />
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="text-xl font-bold text-gray-900"
            >
              Billing Warnet
            </motion.span>
          </motion.div>

          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full"
              >
                Admin Mode
              </motion.span>

              <motion.button
                onClick={handleLogoutClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Logout */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Konfirmasi Logout</h3>
              <p className="text-gray-600 mb-6">
                Anda yakin ingin keluar dari akun admin?
              </p>

              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowConfirm(false)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  whileHover={{ scale: isLoggingOut ? 1 : 1.03 }}
                  whileTap={{ scale: isLoggingOut ? 1 : 0.97 }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isLoggingOut ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                  } transition flex items-center`}
                >
                  {isLoggingOut && (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  )}
                  {isLoggingOut ? "Memproses..." : "Ya, Logout"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Komponen Sidebar dengan animasi
function Sidebar({ currentPath }) {
  const links = [
    {
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
    },
    { path: "/users", icon: <Users className="h-5 w-5" />, label: "Users" },
    {
      path: "/transactions",
      icon: <Receipt className="h-5 w-5" />,
      label: "Transactions",
    },
  ];

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-64 bg-white shadow-md min-h-screen p-4"
    >
      <div className="space-y-2">
        {links.map((link, index) => (
          <motion.div
            key={link.path}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <SidebarLink
              active={currentPath === link.path}
              to={link.path}
              icon={link.icon}
              label={link.label}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Komponen SidebarLink dengan animasi
function SidebarLink({ active, to, icon, label }) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
        active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
      } transition-colors`}
    >
      <motion.span whileHover={{ scale: 1.1 }}>{icon}</motion.span>
      <motion.span whileHover={{ x: 3 }}>{label}</motion.span>
    </Link>
  );
}

// Komponen Loading Screen dengan animasi
function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <motion.div
        animate={{
          rotate: 360,
          transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          },
        }}
        className="h-20 w-20 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </motion.div>
  );
}

// Komponen Error Screen dengan animasi
function ErrorScreen({ error }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md"
      >
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <X className="h-5 w-5 mr-2" />
          Terjadi Kesalahan
        </h3>
        <p className="mb-4">{error}</p>
        <motion.button
          onClick={() => window.location.reload()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Muat Ulang Halaman
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default App;

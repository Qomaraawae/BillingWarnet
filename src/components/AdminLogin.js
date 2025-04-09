import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowSuccess(true);
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      setError("Email atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-xl w-96 border border-gray-200"
      >
        <motion.h2
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold mb-6 text-center text-gray-800"
        >
          Admin Login
        </motion.h2>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin}>
          <motion.div
            className="mb-4"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-700 mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg font-medium transition ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Memproses...
              </div>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50"
          >
            <CheckCircle className="h-6 w-6" />
            <span>Login berhasil! Mengarahkan ke dashboard...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AdminLogin;

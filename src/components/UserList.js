import React, { useState, useEffect } from "react";
import {
  Trash2,
  CheckCircle,
  ArrowRight,
  Lock,
  AlertCircle,
} from "lucide-react";
import useBillingStore from "../store/BillingStore";
import Timer from "./Timer";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

const UserList = ({ adminView = false }) => {
  const { users, removeUser, extendTime, completeSession } = useBillingStore();
  const navigate = useNavigate();
  const [popover, setPopover] = useState({ show: false, type: "", userId: "" });
  const [extendLoading, setExtendLoading] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleTimeEnd = (userId) => {
    console.log(`Waktu untuk user ${userId} telah habis`);
  };

  const handleExtendTime = async (userId, minutes) => {
    try {
      setExtendLoading(userId);
      const packageToAdd = {
        id: `extend-${minutes}`,
        name: `Tambahan ${minutes} menit`,
        time: minutes,
        price: calculateExtendPrice(minutes),
      };
      await extendTime(userId, packageToAdd);
    } catch (error) {
      console.error("Gagal menambah waktu:", error);
    } finally {
      setExtendLoading(null);
    }
  };

  const calculateExtendPrice = (minutes) => {
    return Math.ceil(minutes / 30) * 5000;
  };

  const handleComplete = (userId) => {
    completeSession(userId);
    navigate(`/payment/${userId}`);
  };

  const handleDelete = (userId) => {
    removeUser(userId);
    setPopover({ show: false, type: "", userId: "" });
  };

  const showPopover = (type, userId) => {
    setPopover({ show: true, type, userId });
  };

  const hidePopover = () => {
    setPopover({ show: false, type: "", userId: "" });
  };

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adminView && !isAdmin) {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center mb-4">
          <Lock className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p className="text-gray-600 mt-2">
          Halaman ini hanya dapat diakses oleh admin
        </p>
        <Link
          to="/admin/login"
          className="mt-4 inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Login Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daftar Pengguna Aktif</h2>
        {isAdmin && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Admin Mode
          </span>
        )}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Tidak ada pengguna aktif saat ini</p>
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-600">Paket: {user.packageName}</p>
                <p className="text-gray-600">
                  Harga: Rp {user.price.toLocaleString("id-ID")}
                </p>
                <p
                  className={`text-sm ${
                    user.paymentStatus === "Paid"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  Status: {user.paymentStatus}
                </p>
              </div>

              <div className="text-right">
                <Timer
                  userId={user.id}
                  onTimeEnd={() => handleTimeEnd(user.id)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExtendTime(user.id, 60)}
                  disabled={extendLoading === user.id}
                  className={`px-3 py-1 rounded text-sm flex items-center ${
                    extendLoading === user.id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  } transition`}
                >
                  {extendLoading === user.id ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    "+1 Jam"
                  )}
                </button>
                <button
                  onClick={() => handleExtendTime(user.id, 30)}
                  disabled={extendLoading === user.id}
                  className={`px-3 py-1 rounded text-sm flex items-center ${
                    extendLoading === user.id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  } transition`}
                >
                  {extendLoading === user.id ? "Memproses..." : "+30 Menit"}
                </button>
              </div>

              {isAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => showPopover("complete", user.id)}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 group relative transition"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Selesai
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={14} className="text-green-500" />
                    </span>
                  </button>

                  <button
                    onClick={() => showPopover("delete", user.id)}
                    className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Enhanced Popup Modal */}
      <AnimatePresence>
        {popover.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            onClick={hidePopover}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                {popover.type === "complete" ? (
                  <CheckCircle className="text-green-500 h-6 w-6 mr-3" />
                ) : (
                  <AlertCircle className="text-red-500 h-6 w-6 mr-3" />
                )}
                <h3 className="text-lg font-bold">
                  {popover.type === "complete"
                    ? "Selesaikan Sesi"
                    : "Hapus Pengguna"}
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                {popover.type === "complete"
                  ? "Apakah Anda yakin ingin menyelesaikan sesi ini? Pengguna akan dialihkan ke halaman pembayaran."
                  : "Apakah Anda yakin ingin menghapus data pengguna ini? Tindakan ini tidak dapat dibatalkan."}
              </p>

              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={hidePopover}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={() =>
                    popover.type === "complete"
                      ? handleComplete(popover.userId)
                      : handleDelete(popover.userId)
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    popover.type === "complete"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } transition flex items-center`}
                >
                  {popover.type === "complete" ? "Ya, Selesaikan" : "Ya, Hapus"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserList;

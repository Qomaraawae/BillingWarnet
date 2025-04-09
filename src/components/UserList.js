import React, { useState } from "react";
import { Trash2, CheckCircle, X, ArrowRight } from "lucide-react";
import useBillingStore from "../store/BillingStore";
import Timer from "./Timer";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const UserList = () => {
  const { users, removeUser, extendTime, completeSession } = useBillingStore();
  const navigate = useNavigate();
  const [popover, setPopover] = useState({ show: false, type: "", userId: "" });
  const [extendLoading, setExtendLoading] = useState(null);

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

  const showPopover = (type, userId) => {
    setPopover({ show: true, type, userId });
    setTimeout(() => {
      setPopover((prev) => (prev.show ? { ...prev, show: false } : prev));
    }, 3000);
  };

  return (
    <div className="space-y-4 relative">
      <h2 className="text-2xl font-bold mb-4">Daftar Pengguna Aktif</h2>

      {/* Popover dengan Animasi */}
      <AnimatePresence>
        {popover.show && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
          >
            <motion.div
              className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex items-start max-w-xs"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex-1">
                <h4 className="font-medium">
                  {popover.type === "complete"
                    ? "Selesaikan sesi ini?"
                    : "Hapus pengguna ini?"}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {popover.type === "complete"
                    ? "Pengguna akan dialihkan ke halaman pembayaran"
                    : "Data pengguna akan dihapus permanen"}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <motion.button
                  onClick={() => {
                    popover.type === "complete"
                      ? handleComplete(popover.userId)
                      : removeUser(popover.userId);
                    setPopover({ show: false, type: "", userId: "" });
                  }}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CheckCircle size={18} />
                </motion.button>
                <motion.button
                  onClick={() =>
                    setPopover({ show: false, type: "", userId: "" })
                  }
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {users.map((user) => (
        <motion.div
          key={user.id}
          className="bg-white p-6 rounded-lg shadow-md"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
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
              <motion.button
                onClick={() => handleExtendTime(user.id, 60)}
                disabled={extendLoading === user.id}
                className={`px-3 py-1 rounded text-sm flex items-center ${
                  extendLoading === user.id
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              </motion.button>
              <motion.button
                onClick={() => handleExtendTime(user.id, 30)}
                disabled={extendLoading === user.id}
                className={`px-3 py-1 rounded text-sm flex items-center ${
                  extendLoading === user.id
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {extendLoading === user.id ? "Memproses..." : "+30 Menit"}
              </motion.button>
            </div>

            <div className="flex space-x-2">
              <motion.button
                onClick={() => showPopover("complete", user.id)}
                className="flex items-center px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Selesai
                <motion.span
                  className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100"
                  initial={{ x: 0 }}
                  animate={{ x: 5 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 0.8,
                  }}
                >
                  <ArrowRight size={14} className="text-green-500" />
                </motion.span>
              </motion.button>

              <motion.button
                onClick={() => showPopover("delete", user.id)}
                className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Hapus
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default UserList;

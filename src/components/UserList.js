import React, { useState } from "react";
import { Trash2, CheckCircle, X, ArrowRight } from "lucide-react";
import useBillingStore from "../store/BillingStore";
import Timer from "./Timer";
import { useNavigate } from "react-router-dom";

const UserList = () => {
  const { users, removeUser, extendTime, completeSession } = useBillingStore();
  const navigate = useNavigate();
  const [popover, setPopover] = useState({ show: false, type: "", userId: "" });
  const [extendLoading, setExtendLoading] = useState(null); // State untuk loading per user

  const handleTimeEnd = (userId) => {
    console.log(`Waktu untuk user ${userId} telah habis`);
  };

  const handleExtendTime = async (userId, minutes) => {
    try {
      setExtendLoading(userId); // Set loading untuk user tertentu

      // Buat objek package sesuai kebutuhan fungsi extendTime
      const packageToAdd = {
        id: `extend-${minutes}`,
        name: `Tambahan ${minutes} menit`,
        time: minutes,
        price: calculateExtendPrice(minutes), // Fungsi untuk menghitung harga
      };

      await extendTime(userId, packageToAdd);
    } catch (error) {
      console.error("Gagal menambah waktu:", error);
    } finally {
      setExtendLoading(null); // Reset loading
    }
  };

  // Fungsi untuk menghitung harga tambahan waktu
  const calculateExtendPrice = (minutes) => {
    // Logika harga disesuaikan dengan bisnis Anda
    // Contoh: Rp 5,000 per 30 menit
    return Math.ceil(minutes / 30) * 5000;
  };

  const handleComplete = (userId) => {
    completeSession(userId);
    navigate(`/payment/${userId}`);
  };

  const showPopover = (type, userId) => {
    setPopover({ show: true, type, userId });
    setTimeout(() => setPopover({ show: false, type: "", userId: "" }), 3000);
  };

  return (
    <div className="space-y-4 relative">
      <h2 className="text-2xl font-bold mb-4">Daftar Pengguna Aktif</h2>

      {/* Popover */}
      {popover.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex items-start max-w-xs">
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
              <button
                onClick={() => {
                  popover.type === "complete"
                    ? handleComplete(popover.userId)
                    : removeUser(popover.userId);
                  setPopover({ show: false, type: "", userId: "" });
                }}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() =>
                  setPopover({ show: false, type: "", userId: "" })
                }
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {users.map((user) => (
        <div key={user.id} className="bg-white p-6 rounded-lg shadow-md">
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
                endTime={user.endTime}
                initialTime={Math.floor(
                  (new Date(user.endTime) - new Date()) / 1000
                )}
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
                }`}
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
                }`}
              >
                {extendLoading === user.id ? "Memproses..." : "+30 Menit"}
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => showPopover("complete", user.id)}
                className="flex items-center px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 group relative"
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Selesai
                <span className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={14} className="text-green-500" />
                </span>
              </button>

              <button
                onClick={() => showPopover("delete", user.id)}
                className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;

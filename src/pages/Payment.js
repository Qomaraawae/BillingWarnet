import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QrCode, Download, CheckCircle, X } from "lucide-react";
import useBillingStore from "../store/BillingStore";
import { generatePDFReceipt } from "../utils/pdfGenerator";
import { motion, AnimatePresence } from "framer-motion";

function Payment() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, completePayment } = useBillingStore();
  const [showPopover, setShowPopover] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return <div className="p-8 text-red-500">User tidak ditemukan</div>;
  }

  const handlePaymentConfirmation = () => {
    setShowPopover(true);
  };

  const handleDownloadReceipt = async () => {
    try {
      await generatePDFReceipt({
        ...user,
        paymentTime: new Date().toLocaleString(),
        paymentMethod: "QRIS",
      });
    } catch (error) {
      console.error("Gagal generate struk:", error);
    }
  };

  const handleCompleteTransaction = async () => {
    setIsProcessing(true);
    try {
      await completePayment(userId);
      navigate("/transactions");
    } catch (error) {
      console.error("Gagal menyelesaikan transaksi:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <motion.div
        className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Pembayaran</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Nama:</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Paket:</p>
              <p className="font-medium">{user.packageName}</p>
            </div>
          </div>

          <motion.div
            className="bg-blue-50 p-4 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-blue-800 font-medium text-center">
              Total Pembayaran:
            </p>
            <p className="text-2xl font-bold text-center text-blue-600">
              Rp {user.price.toLocaleString()}
            </p>
          </motion.div>

          <div className="flex flex-col items-center py-4">
            <motion.div
              className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <QrCode size={200} className="text-blue-500" />
              <p className="text-center mt-2 text-sm text-gray-500">
                Scan QRIS untuk pembayaran
              </p>
            </motion.div>
          </div>

          <motion.button
            onClick={handlePaymentConfirmation}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPopover && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
              }}
            >
              <h3 className="text-lg font-bold mb-4">Transaksi Selesai</h3>
              <p className="text-gray-600 mb-6">
                Transaksi akan dicatat dan data pengguna akan diarsipkan
              </p>

              <div className="flex flex-col space-y-3">
                <motion.button
                  onClick={handleDownloadReceipt}
                  className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Struk
                </motion.button>

                <motion.button
                  onClick={handleCompleteTransaction}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={isProcessing}
                  whileHover={{ scale: isProcessing ? 1 : 1.03 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.97 }}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {isProcessing ? "Memproses..." : "Selesai"}
                </motion.button>

                <motion.button
                  onClick={() => setShowPopover(false)}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mt-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <X className="mr-2 h-5 w-5" />
                  Batal
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Payment;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QrCode, Download, CheckCircle, X } from "lucide-react";
import useBillingStore from "../store/BillingStore";
import { generatePDFReceipt } from "../utils/pdfGenerator";

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
      // 1. Simpan data transaksi ke koleksi 'transactions'
      await completePayment(userId);

      // 2. Navigasi ke halaman utama
      navigate("/transactions");
    } catch (error) {
      console.error("Gagal menyelesaikan transaksi:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
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

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium text-center">
              Total Pembayaran:
            </p>
            <p className="text-2xl font-bold text-center text-blue-600">
              Rp {user.price.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
              <QrCode size={200} className="text-blue-500" />
              <p className="text-center mt-2 text-sm text-gray-500">
                Scan QRIS untuk pembayaran
              </p>
            </div>
          </div>

          <button
            onClick={handlePaymentConfirmation}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
          </button>
        </div>
      </div>

      {showPopover && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Transaksi Selesai</h3>
            <p className="text-gray-600 mb-6">
              Transaksi akan dicatat dan data pengguna akan diarsipkan
            </p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Struk
              </button>

              <button
                onClick={handleCompleteTransaction}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isProcessing}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isProcessing ? "Memproses..." : "Selesai"}
              </button>

              <button
                onClick={() => setShowPopover(false)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mt-2"
              >
                <X className="mr-2 h-5 w-5" />
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;

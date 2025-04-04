import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import useBillingStore from "../store/BillingStore";
import { Trash2, X, Check } from "lucide-react";

const Transactions = () => {
  const { payments, fetchPayments, users, fetchUsers } = useBillingStore();
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, [fetchPayments, fetchUsers]);

  const getCustomerDetails = (payment) => {
    if (payment.customerName) return payment.customerName;
    if (payment.userId) {
      const user = users.find((u) => u.id === payment.userId);
      if (user) return user.name;
    }
    if (payment.userData?.name) return payment.userData.name;
    return "Pelanggan Tidak Diketahui";
  };

  const handleDelete = async (paymentId, collectionName = "payments") => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, collectionName, paymentId));
      fetchPayments(); // Refresh data after deletion
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
    } finally {
      setDeleteId(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode Pembayaran
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.date
                      ? format(new Date(payment.date), "dd/MM/yyyy HH:mm")
                      : payment.paymentTime
                      ? format(
                          new Date(payment.paymentTime),
                          "dd/MM/yyyy HH:mm"
                        )
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCustomerDetails(payment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp{" "}
                    {payment.amount
                      ? payment.amount.toLocaleString("id-ID")
                      : payment.amountPaid
                      ? payment.amountPaid.toLocaleString("id-ID")
                      : "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.paymentMethod || "QRIS"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setDeleteId(payment.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus Transaksi"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popover Konfirmasi Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Penghapusan
              </h3>
              <button
                onClick={() => setDeleteId(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus transaksi ini? Aksi ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={() =>
                  handleDelete(
                    deleteId,
                    payments.find((p) => p.id === deleteId)?.isTransaction
                      ? "transactions"
                      : "payments"
                  )
                }
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1" />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

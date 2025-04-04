import React from "react";
import useBillingStore from "../store/BillingStore";

const PaymentComponent = ({ user }) => {
  const makePayment = useBillingStore((state) => state.makePayment);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            user.paymentStatus === "Paid"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {user.paymentStatus}
        </span>
        {user.paymentStatus === "Not Paid" && (
          <button
            onClick={() => makePayment(user.id, user.price)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Pay with QRIS
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentComponent;

import React from "react";
import { Users, Timer, CreditCard } from "lucide-react";
import useBillingStore from "../store/BillingStore";

const Dashboard = () => {
  const users = useBillingStore((state) => state.users);
  const totalRevenue = users.reduce(
    (sum, user) => (user.paymentStatus === "Paid" ? sum + user.price : sum),
    0
  );
  const activeUsers = users.length;
  const pendingPayments = users.filter(
    (user) => user.paymentStatus === "Not Paid"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                Rp {totalRevenue.toLocaleString()}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold">{pendingPayments}</p>
            </div>
            <Timer className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

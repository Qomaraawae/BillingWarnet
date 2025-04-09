import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Pengguna"
          value="124"
          icon="👥"
          bgColor="bg-blue-100"
        />
        <DashboardCard
          title="Pendapatan Hari Ini"
          value="Rp 1.240.000"
          icon="💰"
          bgColor="bg-green-100"
        />
        <DashboardCard
          title="PC Aktif"
          value="24"
          icon="💻"
          bgColor="bg-purple-100"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, bgColor }) {
  return (
    <div className={`${bgColor} p-6 rounded-lg shadow`}>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default AdminDashboard;

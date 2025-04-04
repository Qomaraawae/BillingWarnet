import React from "react";
import UserList from "../components/UserList";
import AddUserForm from "../components/AddUserForm";

const Users = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UserList />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-bold mb-6">Add New Customer</h2>
          <AddUserForm />
        </div>
      </div>
    </div>
  );
};

export default Users;

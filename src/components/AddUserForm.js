import React, { useState } from "react";
import PackageSelector from "./PackageSelector";
import useBillingStore from "../store/BillingStore";

const AddUserForm = () => {
  const [name, setName] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const addUser = useBillingStore((state) => state.addUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && selectedPackage) {
      addUser(name, selectedPackage);
      setName("");
      setSelectedPackage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Customer Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter customer name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Package
        </label>
        <PackageSelector
          onSelect={setSelectedPackage}
          selectedPackage={selectedPackage}
        />
      </div>

      <button
        type="submit"
        disabled={!name || !selectedPackage}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        Add Customer
      </button>
    </form>
  );
};

export default AddUserForm;

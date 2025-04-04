import React from "react";
import useBillingStore from "../store/BillingStore";

const PackageSelector = ({ onSelect, selectedPackage }) => {
  const packages = useBillingStore((state) => state.packages);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => onSelect(pkg)}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedPackage?.id === pkg.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <h3 className="text-lg font-semibold">{pkg.name}</h3>
          <p className="text-gray-600">{pkg.time} minutes</p>
          <p className="text-lg font-bold text-blue-600">
            Rp {pkg.price.toLocaleString()}
          </p>
        </button>
      ))}
    </div>
  );
};

export default PackageSelector;

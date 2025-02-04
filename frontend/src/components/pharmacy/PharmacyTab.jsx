import React, { useState } from "react";
import MedicineList from "./MedicineList";
import ReturnMed from "./ReturnMed";

const PharmacyTab = () => {
  const [activeTab, setActiveTab] = useState("addMedicine");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <button
          className={activeTab === "addMedicine" ? "tab active" : "tab"}
          onClick={() => handleTabClick("addMedicine")}
        >
          Add Medicine
        </button>
        <button
          className={activeTab === "returnMedicine" ? "tab active" : "tab"}
          onClick={() => handleTabClick("returnMedicine")}
        >
          Return Medicine
        </button>
      </div>
      <div className="tabs-content" style={{marginTop: "0", paddingTop: "0"}}>
        {activeTab === "addMedicine" && (
          <div className="tab-content">
            <MedicineList />
          </div>
        )}
        {activeTab === "returnMedicine" && (
          <div className="tab-content">
            <ReturnMed />
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyTab;

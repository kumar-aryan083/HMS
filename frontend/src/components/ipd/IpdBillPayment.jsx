import React, { useState } from "react";
import "./styles/Tab.css"; // Optional: Add custom styling
import IpdBilling from "./IpdBilling";
import IpdPayments from "./IpdPayments";
import OpdBilling from "../opd/OpdBilling";
import OpdPayments from "../opd/OpdPayments";
import ReturnMoney from "../accounts/ReturnMoney";

const Tabs = ({ admissionId, isOpd = false }) => {
  const [activeTab, setActiveTab] = useState("billing");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <button
          className={activeTab === "billing" ? "tab active" : "tab"}
          onClick={() => handleTabClick("billing")}
        >
          Billing
        </button>
        <button
          className={activeTab === "payment" ? "tab active" : "tab"}
          onClick={() => handleTabClick("payment")}
        >
          Payment
        </button>
        {/* <button
          className={activeTab === "returnMoney" ? "tab active" : "tab"}
          onClick={() => handleTabClick("returnMoney")}
        >
          Return Money
        </button> */}
      </div>
      <div className="tabs-content">
        {activeTab === "billing" &&
          (isOpd ? (
            <OpdBilling opdId={admissionId} />
          ) : (
            <IpdBilling admissionId={admissionId} />
          ))}
        {activeTab === "payment" && (
          <div className="tab-content">
            {isOpd ? (
              <OpdPayments opdId={admissionId} />
            ) : (
              <IpdPayments admissionId={admissionId} />
            )}
          </div>
        )}
        {/* {activeTab === "returnMoney" && (
          <div className="tab-content">
            <ReturnMoney admissionId={admissionId} />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Tabs;

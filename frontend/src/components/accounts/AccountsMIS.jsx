import React, { useState } from 'react';

const AccountsMIS = () => {
    const [activeTab, setActiveTab] = useState("OPD Consultant");

    const renderTabContent = () => {
      switch (activeTab) {
        case "OPD Consultant":
          return <OpdConsultantMIS />;
        default:
          return null;
      }
    };
  
    const handleTabClick = (tab) => {
      setActiveTab(tab);
    };
  
    return (
      <>
        <div className="accounts-collections">
          <div className="accounts-heading">
            <h2>MIS</h2>
          </div>
          <div className="accounts-tabs">
            {["OPD Consultant", "OPD Counter", "Lab Consultant", "Investigation Usage"].map((tab) => (
              <div
                className={`single-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
  
          <div className="ac-tab-content">{renderTabContent()}</div>
        </div>
      </>
    );
}

export default AccountsMIS;

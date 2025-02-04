import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wings from "../components/ipd/Wings.jsx";
import VisitingDoctors from "../components/ipd/VisitingDoctors.jsx";
import Rooms from "../components/ipd/Rooms.jsx";
import NursingRates from "../components/ipd/NursingRates.jsx";
import "./styles/IpdSetting.css";
import { AppContext } from "../context/AppContext.jsx";
import PatientType from "../components/ipd/PatientType.jsx";
import IpdRate from "../components/ipd/IpdRate.jsx";
import Packages from "../components/ipd/Packages.jsx";
import Services from "../components/ipd/Services.jsx";
import OtherServices from "../components/ipd/OtherServices.jsx";
import BedAvailability from "../components/ipd/BedAvailability.jsx";

const IpdSettings = () => {
  const { user, setNotification } = useContext(AppContext);
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("wings");

  useEffect(() => {
    document.title = "IPD Setting | HMS";
    if (
      !user ||
      (user.role !== "admin" &&
        user.role !== "counter")
    ) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  const renderContent = () => {
    switch (activeTab) {
      case "wings":
        return <Wings />;
      case "rooms":
        return <Rooms />;
      case "beds":
        return <BedAvailability />;
      case "visitingDoctor":
        return <VisitingDoctors />;
      case "nursingRates":
        return <NursingRates />;
      case "patientType":
        return <PatientType />;
      case "ipdRate":
        return <IpdRate />;
      case "packages":
        return <Packages />;
      case "services":
        return <Services />;
      case "otherServices":
        return <OtherServices />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="upper-is">
        <div className="tab-menu">
          <button
            onClick={() => setActiveTab("wings")}
            className={activeTab === "wings" ? "active" : ""}
          >
            Wings
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={activeTab === "rooms" ? "active" : ""}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab("beds")}
            className={activeTab === "beds" ? "active" : ""}
          >
            Bed Availablility
          </button>
          <button
            onClick={() => setActiveTab("patientType")}
            className={activeTab === "patientType" ? "active" : ""}
          >
            Patient Type
          </button>
          <button
            onClick={() => setActiveTab("visitingDoctor")}
            className={activeTab === "visitingDoctor" ? "active" : ""}
          >
            Visiting Doctor
          </button>
          <button
            onClick={() => setActiveTab("nursingRates")}
            className={activeTab === "nursingRates" ? "active" : ""}
          >
            Nursing Rate
          </button>
          <button
            onClick={() => setActiveTab("ipdRate")}
            className={activeTab === "ipdRate" ? "active" : ""}
          >
            IPD Rate
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={activeTab === "packages" ? "active" : ""}
          >
            Operations
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={activeTab === "services" ? "active" : ""}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab("otherServices")}
            className={activeTab === "otherServices" ? "active" : ""}
          >
            Other Services
          </button>
        </div>
      </div>
      <div className="lower-is">
        <div className="tab-content">{renderContent()}</div>
      </div>
    </>
  );
};

export default IpdSettings;

import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import AdditionalServices from "./AdditionalServices";
import AdditionalSideNav from "./AdditionalSideNav";
import { Route, Routes, useNavigate } from "react-router-dom";
import AdditionalServiceBills from "./AdditionalServiceBills";
import BirthCertificates from "./BirthCertificates";

const AdditionalServiceMain = () => {
  const nav = useNavigate();
  const { user, setNotification } = useContext(AppContext);

  useEffect(() => {
    document.title = "Additional Services | HMS";
    if (!user || (user.role !== "admin" && user.role !== "counter")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  return (
    <>
      <div className="full-opd-rx">
        <AdditionalSideNav />
        <div className="opd-rx-sideContent">
          <Routes>
            <Route path="services" element={<AdditionalServices />} />
            <Route path="service-bill" element={<AdditionalServiceBills />} />
            <Route path="birth-certificates" element={<BirthCertificates />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AdditionalServiceMain;

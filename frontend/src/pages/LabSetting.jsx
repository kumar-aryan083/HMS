import React, { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import LabSettingSideNav from "../components/laboratory/LabSettingSideNav";
import AddLabTest from "../components/laboratory/AddLabTest";
import { AppContext } from "../context/AppContext";
import LabCategory from "../components/laboratory/LabCategory";
import LabLookups from "../components/laboratory/LabLookups";
import LabVendor from "../components/laboratory/LabVendor";
import LabReportTemplate from "../components/laboratory/LabReportTemplate";
import LabTestComponent from "../components/laboratory/LabTestComponent";
import LabInvoiceList from "../components/laboratory/LabInvoiceList";
import LabReports from "../components/laboratory/LabReports";
import LabBilling from "../components/laboratory/LabBilling";
import LabBillReports from "../components/laboratory/LabBillReports";

const LabSetting = () => {
  const nav = useNavigate();
  const { user, setNotification } = useContext(AppContext);

  useEffect(() => {
    document.title = "Laboratory | HMS";
    if (!user || (user.role !== "admin" && user.role !== "laboratory" && user.role !== "counter")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  return (
    <>
      <div className="full-opd-rx">
        <LabSettingSideNav />
        <div className="opd-rx-sideContent">
          <Routes>
            <Route path="lab-test" element={<AddLabTest />} />
            <Route path="lab-category" element={<LabCategory />} />
            <Route path="lab-lookup" element={<LabLookups />} />
            <Route path="lab-vendor" element={<LabVendor />} />
            <Route path="lab-report-template" element={<LabReportTemplate />} />
            <Route path="lab-test-component" element={<LabTestComponent />} />
            <Route path="lab-test-report" element={<LabReports />} />
            <Route path="lab-invoices" element={<LabInvoiceList />} />
            <Route path="lab-reports" element={<LabBillReports />} />
            <Route path="lab-billings" element={<LabBilling />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default LabSetting;

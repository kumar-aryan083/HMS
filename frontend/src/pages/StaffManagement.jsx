import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Route, Routes, useNavigate } from "react-router-dom";
import StaffManagementSidenav from "../components/StaffManagementSidenav";
import StaffAttendences from "../components/StaffAttendences";
import StaffExpenses from "../components/StaffExpenses";

const StaffManagement = () => {
  const nav = useNavigate();
  const { user, setNotification } = useContext(AppContext);

  useEffect(() => {
    document.title = "Store Management | HMS";
    if (!user || (user.role !== "admin" && user.role !== "hr")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  return (
    <>
      <div className="full-opd-rx">
        <StaffManagementSidenav />
        <div className="opd-rx-sideContent">
          <Routes>
            <Route path="attendence" element={<StaffAttendences />} />
            <Route path="staff-expense" element={<StaffExpenses />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default StaffManagement;

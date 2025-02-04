import React, { useContext, useEffect } from "react";
import PatientList from "../components/PatientList";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

const PList = () => {
  const { user, setNotification } = useContext(AppContext);
  const nav = useNavigate();
  useEffect(() => {
    document.title = "Patient Registration | HMS";
    if (
      !user ||
      (user.role !== "admin" &&
        user.role !== "counter" )
    ) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);
  return (
    <>
      <PatientList />
    </>
  );
};

export default PList;

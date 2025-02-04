import React, { useContext, useEffect } from "react";
import PatientRegistration from "../components/PatientRegistration";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

const PRegister = () => {
  const { user, setNotification } = useContext(AppContext);
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Patient Registration | HMS";
    if (
      !user ||
      (user.role !== "admin" &&
        user.role !== "counter")
    ) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  return (
    <>
      <PatientRegistration />
    </>
  );
};

export default PRegister;

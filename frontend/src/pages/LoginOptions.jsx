import React from "react";
import { useNavigate } from "react-router-dom";

const LoginOptions = () => {
  const nav = useNavigate();

  const handleEmployeeLogin = () => {
    nav("/emp-login");
  };

  const handleAdminLogin = () => {
    nav("/admin-login");
  };
  return (
    <>
      <div className="loginPopup">
        <div className="loginPopupContent">
          <h2>Login Options</h2>
          <div className="loginOptions">
            <button className="loginOptionBtn" onClick={handleEmployeeLogin}>
              Employee Login
            </button>
            <button className="loginOptionBtn" onClick={handleAdminLogin}>
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginOptions;

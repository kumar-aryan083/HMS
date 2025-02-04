import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../context/AppContext.jsx";

const Navbar = () => {
  const { message, user, newUser } = useContext(AppContext);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const nav = useNavigate();
  const closeRef = useRef();
  const rNavRef = useRef();
  const bgrRef = useRef();

  useEffect(() => {
    if (message !== "") {
      (() => toast(message))();
    }
  }, [message]);
  const handleClose = () => {
    const screenWidth = window.screen.width;
    if (screenWidth < 950) {
      closeRef.current.style.display = "none";
      rNavRef.current.style.display = "none";
      bgrRef.current.style.display = "flex";
    }
  };
  const handleBgr = () => {
    closeRef.current.style.display = "block";
    rNavRef.current.style.display = "flex";
    bgrRef.current.style.display = "none";
  };
  const handleLogout = () => {
    handleClose();
    newUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    (() => toast("Logged out successfully."))();
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <>
      <nav className="navbar">
        <div className="leftNav">
          <div className="outer">
            <div className="border"></div>
            <div className="inner">
              <Link
                to="/"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "25px",
                  fontWeight: "500",
                  margin: "auto 0",
                  userSelect: "none"
                }}
              >
                HMS
              </Link>
            </div>
          </div>
        </div>
        <div className="rightNav" ref={rNavRef}>
          <ul className="navList">
            {/* <li className="listItems">
              <Link to="/" onClick={handleClose}>
                Home
              </Link>
            </li> */}

            {user && user.role === "admin" && (
              <li className="listItems">
                <span onClick={toggleDropdown} className="dropdownToggle">
                  Administration
                </span>
                {dropdownVisible && (
                  <ul className="dropdownMenu">
                    {/* <li className="listItems">
                      <Link to="/staff-register" onClick={handleClose}>
                        Staff Registration
                      </Link>
                    </li> */}
                    <li className="listItems">
                      <Link to="/staff-list" onClick={handleClose}>
                        Staffs
                      </Link>
                    </li>
                    {/* <li className="listItems">
                      <Link to="/add-department" onClick={handleClose}>
                        Add Departments
                      </Link>
                    </li> */}
                    <li className="listItems">
                      <Link to="/department-list" onClick={handleClose}>
                        Departments
                      </Link>
                    </li>
                    {/* <li className="listItems">
                      <Link to="/add-doctor" onClick={handleClose}>
                        Add Doctors
                      </Link>
                    </li> */}
                    <li className="listItems">
                      <Link to="/doctor-list" onClick={handleClose}>
                        Doctors
                      </Link>
                    </li>
                    <li className="listItems">
                      <Link to="/agents" onClick={handleClose}>
                        Agents
                      </Link>
                    </li>
                    <li className="listItems">
                      <Link to="/cash-handover-report" onClick={handleClose}>
                        Insights
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}

            {/* {user && (user.role === "pharmacy" || user.role === "laboratory") && (
              <li className="listItems">
                <Link to="/cash-handover-report" onClick={handleClose}>
                  Insights
                </Link>
              </li>
            )} */}

            {user &&
              (user.role === "doctor" ||
                user.role === "admin" ||
                user.role === "counter") && (
                <li className="listItems">
                  <span onClick={toggleDropdown} className="dropdownToggle">
                    Patient
                  </span>
                  {dropdownVisible && (
                    <ul className="dropdownMenu">
                      <li className="listItems">
                        <Link to="/patient-register" onClick={handleClose}>
                          Patient Registration
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/patient-list" onClick={handleClose}>
                          Patients List
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            {user &&
              (user.role === "doctor" ||
                user.role === "admin" ||
                user.role === "counter" ||
                user.role === "nurse") && (
                <li className="listItems">
                  <span onClick={toggleDropdown} className="dropdownToggle">
                    IPD
                  </span>
                  {dropdownVisible && (
                    <ul className="dropdownMenu">
                      <li className="listItems">
                        <Link to="/ipd/admit-patient" onClick={handleClose}>
                          Admit Patient
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/ipd/all-ipds" onClick={handleClose}>
                          All IPDs
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/ipd/ipd-setting" onClick={handleClose}>
                          IPD Settings
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/ipd/ipd-stats" onClick={handleClose}>
                          Statistics
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/ipd/ipd-reports" onClick={handleClose}>
                          Reports
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            {user &&
              (user.role === "doctor" ||
                user.role === "admin" ||
                user.role === "counter" ||
                user.role === "nurse") && (
                <li className="listItems">
                  <span onClick={toggleDropdown} className="dropdownToggle">
                    OPD
                  </span>
                  {dropdownVisible && (
                    <ul className="dropdownMenu">
                      <li className="listItems">
                        <Link to="/opd" onClick={handleClose}>
                          Create OPD
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/opd-files" onClick={handleClose}>
                          OPD Files
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/opd/opd-stats" onClick={handleClose}>
                          Statistics
                        </Link>
                      </li>
                      <li className="listItems">
                        <Link to="/opd/opd-rate" onClick={handleClose}>
                          OPD Rate
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            {user &&
              (user.role === "doctor" ||
                user.role === "admin" ||
                user.role === "counter") && (
                <li className="listItems">
                  <Link to="/appointments-list" onClick={handleClose}>
                    Appointments
                  </Link>
                </li>
              )}

            {/* -----------------Pharmacy------------------ */}

            {user && (user.role === "pharmacy" || user.role === "admin") && (
              <li className="listItems">
                <Link to="/pharmacy-setting/supplier" onClick={handleClose}>
                  Pharmacy
                </Link>
              </li>
            )}

            {/* -----------------Laboratory------------------ */}

            {/* {user && <li className="listItems"><Link to="/lab-setting/lab-test" onClick={handleClose}>Laboratory</Link></li>} */}

            {user && (user.role === "laboratory" || user.role === "admin" || user.role === "counter") && (
              <li className="listItems">
                <Link to="/lab-setting/lab-test" onClick={handleClose}>
                  Laboratory
                </Link>
              </li>
            )}

            {/* -----------------Store------------------ */}

            {user && (user.role === "store" || user.role === "admin") && (
              <li className="listItems">
                <Link to="/store/store-categories" onClick={handleClose}>
                  Store
                </Link>
              </li>
            )}

            {/* -----------------Accounts------------------ */}

            {user && user.role === "admin" && (
              <li className="listItems">
                <Link
                  to="/accounts/accounts-income-report"
                  onClick={handleClose}
                >
                  Accounts
                </Link>
              </li>
            )}

            {user && user.role !== "admin" && user.role !== "nurse" && (
              <li className="listItems">
                <Link to="/expenses" onClick={handleClose}>
                  Expenses
                </Link>
              </li>
            )}

            {user && (user.role === "admin" || user.role === "counter") && (
              <li className="listItems">
                <Link to="/additional-services/services" onClick={handleClose}>
                  Additional
                </Link>
              </li>
            )}
            {user && (user.role === "admin" || user.role === "hr") && (
              <li className="listItems">
                <Link to="/staff-management/attendence" onClick={handleClose}>
                  Manage Staff
                </Link>
              </li>
            )}

            {/* {user && <li className="listItems"><Link to="/accounts" onClick={handleClose}>Accounts</Link></li>} */}
            {user && (
              <li className="listItems logoutBtn" onClick={handleLogout}>
                Logout
              </li>
            )}
          </ul>
        </div>
        <div className="closeNav" ref={closeRef} onClick={handleClose}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <div className="bgr" ref={bgrRef} onClick={handleBgr}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </nav>

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default Navbar;

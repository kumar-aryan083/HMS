import React, { useContext, useEffect, useRef, useState } from 'react';
import './styles/Navbar.css';
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../context/AppContext.jsx';

const Navbar = () => {

    const {message, user, newUser} = useContext(AppContext);

    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const nav = useNavigate();
    const closeRef = useRef();
    const rNavRef = useRef();
    const bgrRef = useRef();

    useEffect(() => {
        if (message !== "") {
            (() => toast(message))()
        }
    }, [message])
    const handleClose = () => {
        const screenWidth = window.screen.width;
        if (screenWidth < 950) {
            closeRef.current.style.display = 'none';
            rNavRef.current.style.display = "none";
            bgrRef.current.style.display = 'flex';
        }
    }
    const handleBgr = () => {
        closeRef.current.style.display = 'block';
        rNavRef.current.style.display = "flex";
        bgrRef.current.style.display = 'none';
    }
    const handleLogout = () => {
        handleClose()
        newUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        (() => toast("Logged out successfully."))();
    }

    const handleLoginClick = () => {
        setShowLoginPopup(true);
    }

    const handleClosePopup = () => {
        setShowLoginPopup(false);
    }

    const handleEmployeeLogin = () => {
        nav('/emp-login');
        handleClosePopup();
    }

    const handleAdminLogin = () => {
        nav('/admin-login');
        handleClosePopup();
    }

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
                            <h1>Hospital Management System</h1>
                            <h1>H. M. S.</h1>
                        </div>
                    </div>
                </div>
                <div className="rightNav" ref={rNavRef}>
                    <ul className="navList">
                        <li className="listItems"><Link to="/" onClick={handleClose}>Home</Link></li>

                        {user && (
                            <li className="listItems">
                                <span onClick={toggleDropdown} className="dropdownToggle">
                                    Administration
                                </span>
                                {dropdownVisible && (
                                    <ul className="dropdownMenu">
                                        <li className="listItems"><Link to="/add-department" onClick={handleClose}>Add Departments</Link></li>
                                        <li className="listItems"><Link to="/add-doctor" onClick={handleClose}>Add Doctors</Link></li>
                                    </ul>
                                )}
                            </li>
                        )}
                        {user && (
                            <li className="listItems">
                                <span onClick={toggleDropdown} className="dropdownToggle">
                                    Patient
                                </span>
                                {dropdownVisible && (
                                    <ul className="dropdownMenu">
                                        <li className="listItems"><Link to="/patient-register" onClick={handleClose}>Patient Registration</Link></li>
                                        <li className="listItems"><Link to="/patient-list" onClick={handleClose}>Patients List</Link></li>
                                    </ul>
                                )}
                            </li>
                        )}
                        {user && (
                            <li className="listItems">
                                <span onClick={toggleDropdown} className="dropdownToggle">IPD</span>
                                {dropdownVisible && (
                                    <ul className="dropdownMenu">
                                        <li className="listItems"><Link to='/ipd/admit-patient' onClick={handleClose}>Admit Patient</Link></li>
                                        <li className="listItems"><Link to='/ipd/all-ipds' onClick={handleClose}>All IPDs</Link></li>
                                        <li className="listItems"><Link to='/ipd/ipd-setting' onClick={handleClose}>IPD Settings</Link></li>
                                    </ul>
                                )}
                            </li>
                        )}
                        {user && (
                            <li className="listItems">
                                <span onClick={toggleDropdown} className="dropdownToggle">
                                    OPD
                                </span>
                                {dropdownVisible && (
                                    <ul className="dropdownMenu">
                                        <li className="listItems"><Link to="/opd" onClick={handleClose}>Create OPD</Link></li>
                                        <li className="listItems"><Link to="/opd-files" onClick={handleClose}>OPD Files</Link></li>
                                    </ul>
                                )}
                            </li>
                        )}

                        {/* {user && <li className="listItems"><Link to="/opd" onClick={handleClose}>OPD</Link></li>} */}
                        {user && <li className="listItems"><Link to="/appointments" onClick={handleClose}>Appointments</Link></li>}
                        {user && <li className="listItems"><Link to="/accounts" onClick={handleClose}>Accounts</Link></li>}
                        {!user && <li className="listItems" onClick={handleLoginClick}>Login</li>}
                        {!user && <li className="listItems"><Link to="/emp-register" onClick={handleClose}>Employee Register</Link></li>}
                        {user && <li className="listItems logoutBtn" onClick={handleLogout}>Logout</li>}
                    </ul>
                </div>
                <div className="closeNav" ref={closeRef} onClick={handleClose}><i className="fa-solid fa-xmark"></i></div>
                <div className="bgr" ref={bgrRef} onClick={handleBgr}>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </nav>
            {showLoginPopup && (
                <div className="loginPopup">
                    <div className="loginPopupContent">
                        <button onClick={handleClosePopup} className="closePopupBtn">X</button>
                        <h2>Login Options</h2>
                        <div className="loginOptions">
                            <button className="loginOptionBtn" onClick={handleEmployeeLogin}>Employee Login</button>
                            <button className="loginOptionBtn" onClick={handleAdminLogin}>Admin Login</button>
                        </div>
                    </div>
                </div>
            )}

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
}

export default Navbar;

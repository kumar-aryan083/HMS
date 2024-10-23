import React, { useEffect } from 'react';
import './styles/Navbar.css';
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = ({
    message,
    user,
    newUser,
}) => {
    useEffect(() => {
        if(message !== ""){
            (() => toast(message))()
        }
    }, [message])
    const handleClose = () => {
        const screenWidth = window.screen.width;
        if (screenWidth < 950) {
            const close = document.querySelector('.closeNav');
            const rNav = document.querySelector('.rightNav');
            const bgr = document.querySelector('.bgr');
            close.style.display = 'none';
            rNav.style.display = "none";
            bgr.style.display = 'flex';
        }
    }
    const handleBgr = () => {
        const close = document.querySelector('.closeNav');
        const rNav = document.querySelector('.rightNav');
        const bgr = document.querySelector('.bgr');
        close.style.display = 'block';
        rNav.style.display = "flex";
        bgr.style.display = 'none';
    }
    const handleLogout = () => {
        handleClose()
        newUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        (() => toast("Logged out successfully."))();
    }
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
                <div className="rightNav">
                    <ul className="navList">
                        <li className="listItems"><Link to="/" onClick={handleClose}>Home</Link></li>
                        {user && <li className="listItems"><Link to="/patient-register" onClick={handleClose}>Patient Registration</Link></li>}
                        {user && <li className="listItems"><Link to="/patient-list" onClick={handleClose}>Patients List</Link></li>}
                        {!user && <li className="listItems"><Link to="/emp-login" onClick={handleClose}>Login</Link></li>}
                        {!user && <li className="listItems"><Link to="/emp-register" onClick={handleClose}>Employee Register</Link></li>}
                        {user && <li className="listItems logoutBtn" onClick={handleLogout}>Logout</li>}
                    </ul>
                </div>
                <div className="closeNav" onClick={handleClose}><i className="fa-solid fa-xmark"></i></div>
                <div className="bgr" onClick={handleBgr}>
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
}

export default Navbar;

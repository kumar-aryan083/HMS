import React, { useContext, useEffect } from "react";
import "./styles/Home.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import hospitalImage from "../assets/hospital.jpg"; // Ensure you have this image in the assets folder
import hospitalBackground from "../assets/hospitalBackground.jpg";

const Home = () => {
  const nav = useNavigate();
  const { user } = useContext(AppContext);

  useEffect(() => {
    document.title = "Home | HMS";
  }, []);

  const handleLogin = () => {
    nav("/login");
  };

  const handleRegister = () => {
    nav("/register");
  };

  return (
    <div
      className="home-container"
      // style={{
      //   backgroundImage: `url(${hospitalBackground})`,
      // }}
    >
      <div className="image-container">
        <img src={hospitalImage} alt="Hospital" className="hospital-image" />
      </div>
      <div className="home-message">
        <h1 className="home-title">Welcome to HMS</h1>
        <p className="home-description">
          Your one-stop solution for efficient hospital management.
        </p>
        <div className="button-container">
          {!user && (
            <button className="home-button" onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
        {/* {!user && (
          <button className="home-button" onClick={handleRegister}>
            Register
          </button>
        )} */}
      </div>
    </div>
  );
};

export default Home;

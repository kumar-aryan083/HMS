import React, { useContext, useState } from "react";
import "./styles/Investigations.css";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Investigations = ({ admissionId }) => {
  const nav = useNavigate();
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    labTest: [],
    imagingTest: [],
    updatedAt: new Date(),
  });

  const handleAddTest = (e, testType) => {
    e.preventDefault();
    const testValue = e.target.previousSibling.value;
    if (testValue.trim() !== "") {
      setFormData((prevState) => ({
        ...prevState,
        [testType]: [...prevState[testType], testValue],
      }));
      e.target.previousSibling.value = ""; // Reset the input after adding
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the form data to the backend via a PATCH request
      const response = await fetch(`http://localhost:8000/api/ipd/${admissionId}/investigations`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      // Handle the response (success or error)
      if (response.ok) {
        setNotification(data.message);
        nav(`/ipds/ipd-file/${admissionId}`);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error updating investigations:", error);
      setNotification("Failed to update investigations.");
    }
  };

  return (
    <form className="investigations-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Investigations</h3>

      {/* Lab Tests */}
      <div className="form-group">
        <label className="form-label">Lab Tests</label>
        <div className="test-input-group">
          <input
            type="text"
            className="form-input"
            placeholder="Enter lab test (e.g., Blood Test)"
          />
          <button
            className="add-test-btn"
            onClick={(e) => handleAddTest(e, "labTest")}
          >
            Add Lab Test
          </button>
        </div>
      </div>

      {/* Imaging Tests */}
      <div className="form-group">
        <label className="form-label">Imaging Tests</label>
        <div className="test-input-group">
          <input
            type="text"
            className="form-input"
            placeholder="Enter imaging test (e.g., X-ray)"
          />
          <button
            className="add-test-btn"
            onClick={(e) => handleAddTest(e, "imagingTest")}
          >
            Add Imaging Test
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" className="form-button">
        Submit Investigations
      </button>
    </form>
  );
};

export default Investigations;

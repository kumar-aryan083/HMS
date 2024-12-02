import React, { useContext, useEffect, useState } from "react";
import "./styles/ChiefComplaints.css";
import { AppContext } from "../context/AppContext";

const ChiefComplaints = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
    console.log(complaints);
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/ipd/${admissionId}/get-chief-complaints`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints.complaints || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addComplaint = async (event) => {
    event.preventDefault();
    const complaint = event.target.elements.complaint.value.trim();

    try {
      const response = await fetch(
        `http://localhost:8000/api/ipd/${admissionId}/chief-complaints`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({ complaint }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setComplaints([...complaints, complaint]);
        event.target.reset();
        setNotification(data.message);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error adding complaint:", error);
    }
  };

  return (
    <div className="chief-complaints-container">
      <h2>Chief Complaints</h2>
      <form onSubmit={addComplaint} className="complaint-form">
        <textarea
          type="text"
          name="complaint"
          placeholder="Add a complaint"
          className="complaint-input"
          rows={10}
        />
        <button type="submit" className="complaint-button">
          Add
        </button>
      </form>
      <ul className="complaints-list">
        {complaints.length > 0 ? (
          complaints.map((item, index) => (
            <li key={index} className="complaint-item">
              {item}
            </li>
          ))
        ) : (
          <li className="no-complaints">No complaints available to show</li>
        )}
      </ul>
    </div>
  );
};

export default ChiefComplaints;

import React, { useContext, useEffect, useState } from "react";
import "./styles/ChiefComplaints.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const ChiefComplaints = ({ admissionId, toggleComplaintsPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);

  const addComplaint = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const newComplaint = {
      complaint: formData.get("complaint").trim(),
      type: formData.get("type"),
      duration: formData.get("duration"),
      description: formData.get("description"),
    };
    // console.log(newComplaint);
    try {
      const response = await fetch(
        `${environment.url}/api/ipd/${admissionId}/chief-complaints`,
        {
          method: "PATCH",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(newComplaint),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotification(data.message);
        toggleComplaintsPopup();
        onAssign();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error adding complaint:", error);
    }
  };

  return (
    <div className="chief-complaints-container">
      <h2>Add Chief Complaints</h2>
      <form onSubmit={addComplaint} className="complaint-form">
        <div className="form-row allergies-row-gap">
          <div className="form-group">
            <label htmlFor="type">Complaint Type</label>
            <select name="type" id="type" className="complaint-select" required>
              <option value="">Select Type</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              name="duration"
              placeholder="Duration (e.g., 3 weeks, 2 months)"
              className="complaint-input"
              required
            />
          </div>
        </div>

        <div className="form-group ">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Description (optional)"
            className="complaint-input fg-group"
            rows={6}
          />
        </div>

        <div className="form-group ">
          <label htmlFor="complaint">Complaint</label>
          <textarea
            id="complaint"
            name="complaint"
            placeholder="Add a complaint"
            className="complaint-input"
            rows={6}
            required
          />
        </div>

        <button type="submit" className="complaint-button">
          Add
        </button>
      </form>
    </div>
  );
};

export default ChiefComplaints;

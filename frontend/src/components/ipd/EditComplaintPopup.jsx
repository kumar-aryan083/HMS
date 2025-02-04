import React, { useState } from "react";
import "./styles/EditComplaintPopup.css";

const EditComplaintPopup = ({ complaint, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    type: complaint?.type || "",
    description: complaint?.description || "",
    complaint: complaint?.complaint || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onUpdate({...complaint, formData});
    onClose();
  };

  return (
    <div className="complaint-edit-popup-overlay">
      <div className="complaint-edit-popup-content">
        <button className="complaint-close-popup-btn" onClick={onClose}>
          X
        </button>
        <h2>Edit Complaint</h2>
        <form onSubmit={handleSubmit} className="edit-complaint-form">
          <div className="form-group">
            <label htmlFor="type">Complaint Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Complaint Type</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              required
            ></textarea>
          </div>
          <div className="form-row fg-group">
            <label htmlFor="complaint">Complaint</label>
            <textarea
              id="complaint"
              name="complaint"
              value={formData.complaint}
              onChange={handleInputChange}
              rows="3"
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-btn" style={{backgroundColor: "var(--secondBase)"}}>
            Update Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditComplaintPopup;

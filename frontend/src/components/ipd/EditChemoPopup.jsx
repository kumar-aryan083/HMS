import React, { useState, useContext } from "react";
import "./styles/EditChemoPopup.css";
import { AppContext } from "../../context/AppContext";
// import { environment } from "../../../utlis/environment";

const EditChemoPopup = ({ chemo, onClose, onUpdate }) => {
  const { setNotification } = useContext(AppContext);
  const [chemoDetails, setChemoDetails] = useState(chemo);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setChemoDetails({ ...chemoDetails, [name]: value });
  };

  const handleInvestigationChange = (event) => {
    const { name, value } = event.target;
    setChemoDetails({
      ...chemoDetails,
      investigations: {
        ...chemoDetails.investigations,
        [name]: value,
      },
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    onUpdate({...chemo, chemoDetails});
    onClose();
  };

  return (
    <div className="edit-chemo-popup-overlay">
      <div className="edit-chemo-popup-content">
        <button
          className="edit-chemo-close-btn"
          onClick={onClose}
        >
          X
        </button>
        <h2>Edit Chemo Note</h2>
        <form onSubmit={handleEdit} className="edit-chemo-form">
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Plan:</label>
              <input
                type="text"
                name="plan"
                value={chemoDetails.plan}
                onChange={handleChange}
                className="edit-chemo-input"
                placeholder="Plan"
              />
            </div>
            <div className="form-group">
              <label>Diagnosis:</label>
              <input
                type="text"
                name="diagnosis"
                value={chemoDetails.diagnosis}
                onChange={handleChange}
                className="edit-chemo-input"
                placeholder="Diagnosis"
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>BSA:</label>
              <input
                type="number"
                name="bsa"
                value={chemoDetails.bsa}
                onChange={handleChange}
                className="edit-chemo-input"
                placeholder="BSA"
              />
            </div>
            <div className="form-group">
              <label>Cycles:</label>
              <input
                type="number"
                name="cycles"
                value={chemoDetails.cycles}
                onChange={handleChange}
                className="edit-chemo-input"
                placeholder="Cycles"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Specific Instruction:</label>
            <textarea
              name="specificInstruction"
              value={chemoDetails.specificInstruction}
              onChange={handleChange}
              className="edit-chemo-textarea"
              placeholder="Specific Instruction"
              rows={5}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Side Effects:</label>
            <input
              type="text"
              name="sideEffects"
              value={chemoDetails.sideEffects}
              onChange={handleChange}
              className="edit-chemo-input"
              placeholder="Side Effects"
            />
          </div>

          <div className="form-row fg-group">
            <div className="form-group">
              <label>Height:</label>
              <input
                type="number"
                name="height"
                value={chemoDetails.height}
                onChange={handleChange}
                className="edit-chemo-input"
                placeholder="Height (in cm)"
              />
            </div>
            <div className="form-group">
              <label>Weight:</label>
              <input
                type="number"
                name="weight"
                value={chemoDetails.weight}
                onChange={handleChange}
                className="edit-chemo-input"
                placeholder="Weight (in kg)"
              />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={chemoDetails.date}
                onChange={handleChange}
                className="edit-chemo-input"
              />
            </div>
          </div>

          <div className="form-group">
            <h3>Investigations</h3>
            <div className="edit-investigations-container">
              {Object.keys(chemoDetails.investigations).map((key, index) => (
                <div key={key} className="investigation-group">
                  <label>{key.replace(/([A-Z])/g, " $1").trim()}:</label>
                  <select
                    name={key}
                    value={chemoDetails.investigations[key]}
                    onChange={handleInvestigationChange}
                    className="edit-investigation-select"
                  >
                    <option value="Acceptable">Acceptable</option>
                    <option value="Not Acceptable">Not Acceptable</option>
                    <option value="None">None</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="edit-chemo-submit-btn">
            Update Chemo Note
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditChemoPopup;

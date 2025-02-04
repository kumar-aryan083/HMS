import React, { useContext, useState } from "react";
import "./styles/ChemoNotes.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const ChemoNotes = ({ admissionId, toggleChemoPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const [chemoDetails, setChemoDetails] = useState({
    plan: "",
    diagnosis: "",
    bsa: "",
    cycles: "",
    specificInstruction: "",
    sideEffects: "",
    height: "",
    weight: "",
    date: "",
    investigations: {
      lft: "None",
      kft: "None",
      cbcDiff: "None",
      viralMarker: "None",
      echo: "None",
      familyCounselling: "None",
      ivAccess: "None",
    },
  });

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

  const addChemo = async (e) => {
    e.preventDefault();
    // console.log(chemoDetails);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/chemo-notes`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(chemoDetails),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        toggleChemoPopup();
        onAssign();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="chemo-notes-container">
      <h2>Add Chemo Notes</h2>
      <form onSubmit={addChemo} className="chemo-form">
        {/* General Info Section */}
        <div className="form-row fg-group">
          <div className="form-group">
            <label>Plan:</label>
            <input
              type="text"
              name="plan"
              value={chemoDetails.plan}
              onChange={handleChange}
              className="chemo-input"
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
              className="chemo-input"
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
              className="chemo-input"
              placeholder="BSA"
            />
          </div>
          <div className="form-group">
            <label>Number of Cycles:</label>
            <input
              type="number"
              name="cycles"
              value={chemoDetails.cycles}
              onChange={handleChange}
              className="chemo-input"
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
            className="chemo-textarea"
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
            className="chemo-input"
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
              className="chemo-input"
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
              className="chemo-input"
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
              className="chemo-input"
            />
          </div>
        </div>

        {/* Investigations Section */}
        <div className="form-group">
          <h3>Investigations</h3>
          <div className="investigations-container">
            {Object.keys(chemoDetails.investigations).map(
              (investigation, index) => (
                <div
                  key={investigation}
                  className={`investigation-group ${
                    index % 3 === 0 ? "first" : ""
                  }`}
                >
                  <label>
                    {investigation
                      .toUpperCase()
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                    :
                  </label>
                  <select
                    name={investigation}
                    value={chemoDetails.investigations[investigation]}
                    onChange={handleInvestigationChange}
                    className="investigation-select"
                  >
                    <option value="Acceptable">Acceptable</option>
                    <option value="Not Acceptable">Not Acceptable</option>
                    <option value="None">None</option>
                  </select>
                </div>
              )
            )}
          </div>
        </div>

        <button type="submit" className="chemo-submit-btn">
          Add Chemo Notes
        </button>
      </form>
    </div>
  );
};

export default ChemoNotes;

import React, { useState, useEffect, useRef, useContext } from "react";
import "./styles/DischargeSummary.css";
import { Editor } from "@tinymce/tinymce-react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const DischargeSummary = ({ admissionId }) => {
  const nav = useNavigate();
  const { setNotification } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dischargeSummary, setDischargeSummary] = useState({
    dischargeDate: "",
    statusAtDischarge: "Recovered",
    dischargeNotes: "",
    finalDiagnosis: "",
    procedures: [""],
    medications: [""],
    followUpInstructions: "",
    dischargingDoctor: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [diagnosisContent, setDiagnosisContent] = useState("");
  const [notesContent, setNotesContent] = useState("");
  const [followupContent, setFollowupContent] = useState("");
  const editorRefDiagnosis = useRef(null);
  const editorRefNotes = useRef(null);
  const editorRefFollowup = useRef(null);

  const handleDiagnosisChange = (value) => {
    setDiagnosisContent(value);
  };
  const handleNotesChange = (value) => {
    setNotesContent(value);
  };
  const handleFollowupChange = (value) => {
    setFollowupContent(value);
  };

  // Fetching doctors list for selection
  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/employee/get-doctors`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors);
      } else {
        setError("Failed to fetch doctors.");
      }
    } catch (err) {
      setError("Failed to fetch doctors.");
    }
  };

  // Fetch discharge summary data
  const fetchDischargeSummary = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/ipd/${admissionId}/get-discharge-summary`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDischargeSummary(data.dischargeSummary || {});
      } else {
        setError("Failed to fetch discharge summary data1.");
      }
    } catch (err) {
      setError("Failed to fetch discharge summary data2.");
    } finally {
      setLoading(false);
    }
  };

  // Handle changes in form fields
  const handleChange = (name, value) => {
    setDischargeSummary((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle procedures and medications dynamically
  const handleArrayChange = (name, index, value) => {
    const updatedArray = [...dischargeSummary[name]];
    updatedArray[index] = value;
    setDischargeSummary((prevState) => ({
      ...prevState,
      [name]: updatedArray,
    }));
  };

  // Add new procedure or medication
  const addNewItem = (name) => {
    setDischargeSummary((prevState) => ({
      ...prevState,
      [name]: [...prevState[name], ""],
    }));
  };

  // Submit the form to update the discharge summary
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...dischargeSummary,
      finalDiagnosis: diagnosisContent,
      dischargeNotes: notesContent,
      followUpInstructions: followupContent,
    };
    console.log(updatedData);
    try {
      const res = await fetch(
        `http://localhost:8000/api/ipd/admissions/${admissionId}/discharge-summary`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        console.log(data);
        setNotification(data.message);
        nav(`/ipds/ipd-file/${admissionId}`)
      }
    } catch (err) {
      setError("Failed to update discharge summary.", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchDischargeSummary();
  }, [admissionId]);

  if (loading) {
    return <p>Loading discharge summary...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="discharge-summary-container">
      <h2>Discharge Summary</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dischargeDate">Discharge Date:</label>
            <input
              type="date"
              id="dischargeDate"
              value={dischargeSummary.dischargeDate}
              onChange={(e) => handleChange("dischargeDate", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="statusAtDischarge">Status at Discharge:</label>
            <select
              id="statusAtDischarge"
              value={dischargeSummary.statusAtDischarge}
              onChange={(e) =>
                handleChange("statusAtDischarge", e.target.value)
              }
            >
              <option value="Recovered">Recovered</option>
              <option value="Referred">Referred</option>
              <option value="Deceased">Deceased</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dischargeNotes">Discharge Notes:</label>
          <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRefNotes.current = editor)}
            initialValue="<p>Write dishcarge notes here.</p>"
            onEditorChange={handleNotesChange}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="finalDiagnosis">Final Diagnosis:</label>
          <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRefDiagnosis.current = editor)}
            initialValue="<p>Write final diagnosis here.</p>"
            onEditorChange={handleDiagnosisChange}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
        </div>

        <div className="form-group">
          <label>Procedures:</label>
          {dischargeSummary.procedures.map((procedure, index) => (
            <div className="input-row" key={index}>
              <input
                type="text"
                value={procedure}
                onChange={(e) =>
                  handleArrayChange("procedures", index, e.target.value)
                }
                placeholder="e.g., Appendectomy"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setDischargeSummary((prevState) => ({
                      ...prevState,
                      procedures: prevState.procedures.filter(
                        (_, idx) => idx !== index
                      ),
                    }))
                  }
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addNewItem("procedures")}
            className="add-item-btn"
          >
            Add Procedure
          </button>
        </div>

        <div className="form-group">
          <label>Medications:</label>
          {dischargeSummary.medications.map((medication, index) => (
            <div className="input-row" key={index}>
              <input
                type="text"
                value={medication}
                onChange={(e) =>
                  handleArrayChange("medications", index, e.target.value)
                }
                placeholder="e.g., Paracetamol 500mg"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setDischargeSummary((prevState) => ({
                      ...prevState,
                      medications: prevState.medications.filter(
                        (_, idx) => idx !== index
                      ),
                    }))
                  }
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addNewItem("medications")}
            className="add-item-btn"
          >
            Add Medication
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="followUpInstructions">Follow-Up Instructions:</label>
          <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRefFollowup.current = editor)}
            initialValue="<p>Write Follow up instructions here.</p>"
            onEditorChange={handleFollowupChange}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dischargingDoctor">Discharging Doctor:</label>
          <select
            id="dischargingDoctor"
            value={dischargeSummary.dischargingDoctor}
            onChange={(e) => handleChange("dischargingDoctor", e.target.value)}
          >
            <option value="">Select Doctor</option>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name}
                </option>
              ))
            ) : (
              <option>No doctor available</option>
            )}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default DischargeSummary;

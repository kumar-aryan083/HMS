import React, { useState, useEffect, useRef, useContext } from "react";
import "./styles/PhysicalExamination.css";
import { Editor } from "@tinymce/tinymce-react";
import { AppContext } from "../context/AppContext";

const PhysicalExamination = ({ admissionId }) => {
    const {setNotification} = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [physicalExamination, setPhysicalExamination] = useState({
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      bmi: ""
    },
  });
  const [updatedAt, setUpdatedAt] = useState("");
  const editorRef = useRef(null);
  const [content, setContent] = useState("");

  const fetchPhysicalExamination = async () => {
    try {
    } catch (err) {
      setError("Failed to fetch physical examination data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    setContent(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
        findings: content,
        vitalSigns: physicalExamination.vitalSigns,
      };
    try {
        const response = await fetch(`http://localhost:8000/api/ipd/${admissionId}/physical-examination`, {
            method: "PATCH", // or "PUT" depending on your server logic
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem('token')
            },
            body: JSON.stringify(updatedData),
          });
    
          const result = await response.json();
    
          if (response.ok) {
            setUpdatedAt(result.ipdFile.physicalExamination.updatedAt);
            if (editorRef.current) editorRef.current.setContent('');
            setPhysicalExamination({
                vitalSigns: {
                    bloodPressure: "",
                    heartRate: "",
                    temperature: "",
                    respiratoryRate: "",
                    oxygenSaturation: "",
                    bmi: ""
                  },
            })
            setNotification(result.message);
          }
    } catch (err) {
      console.log(err);
    }
  };

  const handleVitalSignChange = (name, value) => {
    setPhysicalExamination((prevState) => ({
      ...prevState,
      vitalSigns: { ...prevState.vitalSigns, [name]: value },
    }));
  };

  useEffect(() => {
    fetchPhysicalExamination();
  }, [admissionId]);

  if (loading) {
    return <p>Loading physical examination data...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="physical-examination-container">
      <h2>Physical Examination</h2>
      <form onSubmit={handleSubmit}>
      <h3>Vital Signs</h3>
      <div className="form-row">
          <div className="form-group">
            <label htmlFor="bloodPressure">Blood Pressure (mmHg):</label>
            <input
              type="text"
              id="bloodPressure"
              name="bloodPressure"
              value={physicalExamination.vitalSigns.bloodPressure}
              onChange={(e) =>
                handleVitalSignChange("bloodPressure", e.target.value)
              }
              placeholder="e.g., 120/80"
            />
          </div>
          <div className="form-group">
            <label htmlFor="heartRate">Heart Rate (bpm):</label>
            <input
              type="text"
              id="heartRate"
              name="heartRate"
              value={physicalExamination.vitalSigns.heartRate}
              onChange={(e) =>
                handleVitalSignChange("heartRate", e.target.value)
              }
              placeholder="e.g., 72"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="temperature">Temperature (°C):</label>
            <input
              type="text"
              id="temperature"
              name="temperature"
              value={physicalExamination.vitalSigns.temperature}
              onChange={(e) =>
                handleVitalSignChange("temperature", e.target.value)
              }
              placeholder="e.g., 36.6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="respiratoryRate">Respiratory Rate (breaths/min):</label>
            <input
              type="text"
              id="respiratoryRate"
              name="respiratoryRate"
              value={physicalExamination.vitalSigns.respiratoryRate}
              onChange={(e) =>
                handleVitalSignChange("respiratoryRate", e.target.value)
              }
              placeholder="e.g., 16"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="oxygenSaturation">Oxygen Saturation (%):</label>
            <input
              type="text"
              id="oxygenSaturation"
              name="oxygenSaturation"
              value={physicalExamination.vitalSigns.oxygenSaturation}
              onChange={(e) =>
                handleVitalSignChange("oxygenSaturation", e.target.value)
              }
              placeholder="e.g., 98"
            />
          </div>
          <div className="form-group">
            <label htmlFor="oxygenSaturation">BMI (in kg/m<sup>2</sup>):</label>
            <input
              type="text"
              id="bmi"
              name="bmi"
              value={physicalExamination.vitalSigns.bmi}
              onChange={(e) =>
                handleVitalSignChange("bmi", e.target.value)
              }
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="findings">Findings:</label>

          <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue="<p>Remove this and write your content.</p>"
            onEditorChange={handleEditorChange}
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
        
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>

      {updatedAt && (
        <div className="updated-info">
          <p>
            <strong>Last Updated:</strong>{" "}
            {new Date(updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default PhysicalExamination;

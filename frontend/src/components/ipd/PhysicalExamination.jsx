import React, { useState, useEffect, useRef, useContext } from "react";
import "./styles/PhysicalExamination.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const PhysicalExamination = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [physicalExamination, setPhysicalExamination] = useState({
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      bmi: "",
    },
    doctorName: "",
    doctorId: "",
    sensorium: "",
    pallor: "",
    jaundice: "",
    cyanosis: "",
    oedema: "",
    clubbing: "",
    hair: "",
    skin: "",
    nails: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [editorContent, setEditorContent] = useState({
    findings: "",
    respiratorySystem: "",
    urinarySystem: "",
    nervousSystem: "",
    cardiovascularSystem: "",
    others: "",
  });

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/employee/get-doctors`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors); // Assuming the API returns a list of doctors.
      } else {
        setError("Failed to fetch doctors.");
      }
    } catch (err) {
      setError("Failed to fetch doctors.");
    }
  };

  const fetchPhysicalExamination = async () => {
    try {
      // Fetch initial physical examination data here if needed
    } catch (err) {
      setError("Failed to fetch physical examination data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setPhysicalExamination((prevState) => ({
      ...prevState,
      doctorName: value,
    }));
    if (value.length > 3) {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setPhysicalExamination((prevState) => ({
      ...prevState,
      doctorId: doctor._id,
      doctorName: doctor.name,
    }));
    setFilteredDoctors([]);
  };

  const handleVitalSignChange = (name, value) => {
    setPhysicalExamination((prevState) => ({
      ...prevState,
      vitalSigns: { ...prevState.vitalSigns, [name]: value },
    }));
  };

  const handleDropdownChange = (name, value) => {
    setPhysicalExamination((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditorChange = (name, value) => {
    setEditorContent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (name, value) => {
    setPhysicalExamination((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      ...editorContent,
      vitalSigns: physicalExamination.vitalSigns,
      doctor: physicalExamination.doctorId,
      sensorium: physicalExamination.sensorium,
      pallor: physicalExamination.pallor,
      jaundice: physicalExamination.jaundice,
      cyanosis: physicalExamination.cyanosis,
      oedema: physicalExamination.oedema,
      clubbing: physicalExamination.clubbing,
      hair: physicalExamination.hair,
      skin: physicalExamination.skin,
      nails: physicalExamination.nails,
    };

    // console.log("Updated Physical Examination Data:", updatedData);

    try {
      const response = await fetch(
        `${environment.url}/api/ipd/${admissionId}/physical-examination`,
        {
          method: "PATCH",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setNotification(result.message);
        setPhysicalExamination({
          vitalSigns: {
            bloodPressure: "",
            heartRate: "",
            temperature: "",
            respiratoryRate: "",
            oxygenSaturation: "",
            bmi: "",
          },
          doctorName: "",
          doctorId: "",
          sensorium: "",
          pallor: "",
          jaundice: "",
          cyanosis: "",
          oedema: "",
          clubbing: "",
          hair: "",
          skin: "",
          nails: "",
        });
        setEditorContent({
          findings: "",
          respiratorySystem: "",
          urinarySystem: "",
          nervousSystem: "",
          cardiovascularSystem: "",
          others: "",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
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
        <h3 style={{ textAlign: "left", margin: "0" }}>Vital Signs</h3>
        <div className="form-row fg-group">
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
        <div className="form-row fg-group">
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
            <label htmlFor="respiratoryRate">
              Respiratory Rate (breaths/min):
            </label>
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
        <div className="form-row fg-group">
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
            <label htmlFor="bmi">BMI (kg/m²):</label>
            <input
              type="text"
              id="bmi"
              name="bmi"
              value={physicalExamination.vitalSigns.bmi}
              onChange={(e) => handleVitalSignChange("bmi", e.target.value)}
            />
          </div>
        </div>
        <h3 style={{ textAlign: "left", margin: "0" }}>Additional Signs</h3>
        <div className="dropdown-grid fg-group">
          {[
            "sensorium",
            "pallor",
            "jaundice",
            "cyanosis",
            "oedema",
            "clubbing",
          ].map((field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              <select
                id={field}
                value={physicalExamination[field]}
                onChange={(e) => handleDropdownChange(field, e.target.value)}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
          ))}
        </div>
        <div className="form-row fg-group">
          {["hair", "skin", "nails"].map((field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              <input
                type="text"
                id={field}
                value={physicalExamination[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={`Enter text here`}
                required
              />
            </div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="doctorName">Doctor Name:</label>
          <input
            type="text"
            id="doctorName"
            name="doctorName"
            value={physicalExamination.doctorName}
            onChange={handleDoctorInput}
            placeholder="Search doctor by name"
          />
          {filteredDoctors.length > 0 && (
            <ul className="doctor-suggestions">
              {filteredDoctors.map((doctor) => (
                <li key={doctor._id} onClick={() => handleDoctorSelect(doctor)}>
                  {doctor.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {[
          "findings",
          "respiratorySystem",
          "urinarySystem",
          "nervousSystem",
          "cardiovascularSystem",
          "others",
        ].map((system) => (
          <div className="form-group" key={system}>
            <label htmlFor={system}>
              {system
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              :
            </label>

            <ReactQuill
              theme="snow"
              value={editorContent[system]}
              onChange={(value) => handleEditorChange(system, value)}
              placeholder="Write findings..."
              modules={{
                toolbar: [
                  // Text styles
                  [{ header: [1, 2, 3, false] }], // Header sizes
                  [{ font: [] }], // Font selection
                  [{ size: ["small", false, "large", "huge"] }], // Font size

                  // Formatting options
                  ["bold", "italic", "underline", "strike"], // Text formatting
                  [{ color: [] }, { background: [] }], // Text and background color
                  [{ script: "sub" }, { script: "super" }], // Subscript / superscript
                  ["blockquote", "code-block"], // Blockquote and code block

                  // List and indentation
                  [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
                  [{ indent: "-1" }, { indent: "+1" }], // Indentation
                  [{ align: [] }], // Text alignment

                  // Media and links
                  ["link", "image", "video"], // Insert links, images, and videos

                  // Miscellaneous
                  ["clean"], // Remove formatting
                ],
              }}
              formats={[
                "header",
                "font",
                "size",
                "bold",
                "italic",
                "underline",
                "strike",
                "color",
                "background",
                "script",
                "blockquote",
                "code-block",
                "list",
                "bullet",
                "indent",
                "align",
                "link",
                "image",
                "video",
              ]}
            />
          </div>
        ))}

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

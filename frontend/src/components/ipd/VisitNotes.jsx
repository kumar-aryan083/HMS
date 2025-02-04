import React, { useState, useEffect, useContext, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/VisitNotes.css"; // Add your custom styling
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const VisitNotes = ({ admissionId, toggleVisitPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [doctorId, setDoctorId] = useState(""); // Added doctorId state
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    // Simulate fetching doctors data for suggestions
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
          setDoctors(data.doctors); // Assuming the API returns a list of doctors
        } else {
          setError("Failed to fetch doctors.");
        }
      } catch (err) {
        setError("Failed to fetch doctors.");
      }
    };
    fetchDoctors();
    setLoading(false);
  }, []);

  const handleAddNote = async () => {
    if (!newNote.trim() || !doctorName.trim() || !dateTime || !doctorId) return;

    // Print the data to the console before sending it to the backend
    // console.log({
    //   note: newNote,
    //   doctorName: doctorName,
    //   doctorId: doctorId,
    //   dateTime: dateTime,
    // });

    try {
      const response = await fetch(
        `${environment.url}/api/ipd/${admissionId}/visit-notes`,
        {
          method: "PATCH",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            note: newNote,
            doctorName,
            doctorId,
            dateTime,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setNotification(data.message);
        toggleVisitPopup();
        onAssign();
      } else {
        setNotification("Failed to add new visit note.");
      }
    } catch (err) {
      setNotification("Failed to add new visit note.");
    }
  };

  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setDoctorName(value);
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
    setDoctorName(doctor.name);
    setDoctorId(doctor._id); // Set the selected doctor's ID
    setFilteredDoctors([]);
  };

  const handleNoteChange = (value) => {
    setNewNote(value);
  };

  const handleDateTimeChange = (e) => {
    setDateTime(e.target.value);
  };

  if (loading) {
    return <p>Loading visit notes...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="visit-notes-container">
      <h2>Visit Notes</h2>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="doctorName">Doctor Name:</label>
          <input
            type="text"
            id="doctorName"
            value={doctorName}
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
        <div className="form-group">
          <label htmlFor="dateTime">Date and Time:</label>
          <input
            type="datetime-local"
            id="dateTime"
            value={dateTime}
            onChange={handleDateTimeChange}
            required
          />
        </div>
      </div>
      <div className="add-note-section form-group">
        <label htmlFor="newNote">Add a New Visit Note:</label>
        <ReactQuill
          theme="snow"
          value={newNote}
          onChange={setNewNote}
          placeholder="Write about visit note..."
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

        <button type="button" onClick={handleAddNote} className="add-note-btn">
          Add Note
        </button>
      </div>

      <div className="last-updated">
        {updatedAt && (
          <p>Last updated on: {new Date(updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default VisitNotes;

import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/EditVisitNotePopup.css"; // Add your custom styling

const EditVisitNotePopup = ({ note, onClose, onUpdate }) => {
  const { setNotification } = useContext(AppContext);
  const [doctorName, setDoctorName] = useState(note.doctorId.name);
  const [doctorId, setDoctorId] = useState(note.doctorId._id);
  const [newNote, setNewNote] = useState(note.note);
  const [dateTime, setDateTime] = useState(note.dateTime);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch doctors for suggestions
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
          setDoctors(data.doctors);
        } else {
          setError("Failed to fetch doctors.");
        }
      } catch (err) {
        setError("Failed to fetch doctors.");
      }
      setLoading(false);
    };
    fetchDoctors();
  }, []);

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

  const handleDateTimeChange = (e) => {
    setDateTime(e.target.value);
  };

  const handleSaveChanges = async () => {
    const updatedBody = {
      note: newNote,
      doctorName,
      doctorId,
      dateTime,
    };
    onUpdate({ ...note, updatedBody });
    onClose();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="edit-visit-note-popup">
      <div className="popup-content" style={{height: "88%"}}>
        <button className="opd-closeBtn" onClick={onClose}>
          X
        </button>
        <h2>Edit Visit Note</h2>
        <div className="form-row fg-group">
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
                  <li
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
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
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="newNote">Visit Note:</label>
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
        </div>

        <button className="save-btn" onClick={handleSaveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditVisitNotePopup;

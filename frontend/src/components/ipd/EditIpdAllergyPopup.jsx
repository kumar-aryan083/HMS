import React, { useContext, useState, useEffect } from "react";
import "./styles/EditIpdAllergyPopup.css";
import { AppContext } from "../../context/AppContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { environment } from "../../../utlis/environment";

const EditIpdAllergyPopup = ({ allergy, onClose, onUpdate }) => {
  const { setNotification } = useContext(AppContext);
  const [content, setContent] = useState(allergy.notes || "");
  const [allergyName, setAllergyName] = useState(allergy.allergyName || "");
  const [allergyType, setAllergyType] = useState(allergy.allergyType || "");
  const [doctorName, setDoctorName] = useState(allergy.doctorId?.name || "");
  const [doctorId, setDoctorId] = useState(allergy.doctorId?._id || "");
  const [allergyDate, setAllergyDate] = useState(
    allergy.dateTime?.split("T")[0] || ""
  );
  const [allergyTime, setAllergyTime] = useState(
    allergy.dateTime?.split("T")[1] || ""
  );
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
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
          setNotification("Failed to fetch doctors.");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setNotification("Error fetching doctor list.");
      }
    };
    fetchDoctors();
  }, []);

  const handleDoctorInput = (e) => {
    const searchValue = e.target.value;
    setDoctorName(searchValue);
    if (searchValue.length > 2) {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setDoctorName(doctor.name);
    setDoctorId(doctor._id);
    setFilteredDoctors([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedBody = {
      allergyName,
      allergyType,
      notes: content,
      doctorId,
      dateTime: `${allergyDate}T${allergyTime}`,
    };
    onUpdate({ ...allergy, updatedBody });
    onClose();
  };

  return (
    <div className="edit-ipd-allergy-popup">
      <div className="edit-ipd-allergy-content">
        <button className="opd-closeBtn" onClick={onClose}>
          X
        </button>
        <h2>Edit Allergy</h2>
        <form onSubmit={handleUpdate} className="edit-allergy-form">
          <div className="form-row fg-group">
            <div className="form-group">
              <label htmlFor="edit-allergy-name">Allergy Name:</label>
              <input
                id="edit-allergy-name"
                type="text"
                value={allergyName}
                onChange={(e) => setAllergyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-allergy-type">Allergy Type:</label>
              <select
                id="edit-allergy-type"
                value={allergyType}
                onChange={(e) => setAllergyType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="Food">Food</option>
                <option value="Drug">Drug</option>
                <option value="Environmental">Environmental</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label htmlFor="edit-doctor-name">Doctor Name:</label>
              <input
                id="edit-doctor-name"
                type="text"
                value={doctorName}
                onChange={handleDoctorInput}
                autoComplete="off"
                required
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
              <label htmlFor="edit-allergy-date">Date:</label>
              <input
                id="edit-allergy-date"
                type="date"
                value={allergyDate}
                onChange={(e) => setAllergyDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-allergy-time">Time:</label>
              <input
                id="edit-allergy-time"
                type="time"
                value={allergyTime}
                onChange={(e) => setAllergyTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-allergies-notes">Notes:</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Write notes about the allergy..."
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
          <button type="submit" className="update-allergy-button">
            Update Allergy
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditIpdAllergyPopup;

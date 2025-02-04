import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { environment } from "../../../utlis/environment";
import "./styles/EditFollowupPopup.css";

const EditFollowupPopup = ({ followup, onClose, onUpdate }) => {
  const [followUpDate, setFollowUpDate] = useState(followup.date || "");
  const [doctorId, setDoctorId] = useState(followup.doctorId || "");
  const [content, setContent] = useState(followup.notes || "");
  const [doctors, setDoctors] = useState([]);

  // Fetch list of doctors to populate the dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${environment.url}/api/employee/get-doctors`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });
        const data = await res.json();
        if (res.ok) {
          setDoctors(data.doctors);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Handle editor change
  const handleEditorChange = (value) => {
    setContent(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedBody = {
      ...followup,
      date: followUpDate,
      assignedBy: doctorId,
      notes: content,
    };
    onUpdate(updatedBody);
  };

  return (
    <div className="edit-followup-popup">
      <div className="edit-followup-popup-content">
        <button className="opd-closeBtn" onClick={onClose}>
          X
        </button>
        <h2>Edit Follow-Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label htmlFor="followUpDate">Follow-Up Date</label>
              <input
                type="date"
                id="followUpDate"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="doctorId">Assigning Doctor</label>
              <select
                id="doctorId"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Write notes about the followup..."
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
          <button type="submit">Update Follow-Up</button>
        </form>
      </div>
    </div>
  );
};

export default EditFollowupPopup;

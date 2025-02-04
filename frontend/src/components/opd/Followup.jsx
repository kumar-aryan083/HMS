import React, { useState, useEffect, useRef, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/Followup.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const Followup = ({ opdId, toggleFollowupPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const [followUpDate, setFollowUpDate] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [content, setContent] = useState("");

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${environment.url}/api/opd/${opdId}/followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          followUpDate: followUpDate,
          doctorId: doctorId,
          notes: content,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        toggleFollowupPopup();
        onAssign();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="follow-up-component">
      <h2>Add Follow-Up Date</h2>
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
            placeholder="Write notes about the follow up..."
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
        <button type="submit">Add Follow-Up</button>
      </form>
    </div>
  );
};

export default Followup;

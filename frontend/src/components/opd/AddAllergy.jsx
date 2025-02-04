import React, { useContext, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/AddAllergy.css";
import { useNavigate } from "react-router-dom";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";

const AddAllergy = ({ opdId, toggleAllergyPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const nav = useNavigate();
  const [notes, setNotes] = useState("");
  const [allergyName, setAllergyName] = useState("");
  const [severity, setSeverity] = useState("");

  const saveContent = async () => {
    // console.log(allergyName);
    // console.log(severity);
    // console.log(notes);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/add-allergy/${opdId}`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            allergyName,
            severity,
            notes,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        toggleAllergyPopup();
        onAssign();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="full-allergy">
      <div className="allergy-header">
        <h3>Add Allergy</h3>
      </div>
      <div className="form-row fg-group">
        <div className="form-group">
          <label>Allergy Name</label>
          <input
            type="text"
            value={allergyName}
            onChange={(e) => setAllergyName(e.target.value)}
            placeholder="Enter allergy name"
            className="allergy-input"
          />
        </div>
        <div className="form-group">
          <label>Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="allergy-input"
          >
            <option value="">Select severity</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <ReactQuill
          theme="snow"
          value={notes}
          onChange={setNotes}
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

      <button onClick={saveContent} className="allergy-btn">
        Add Allergy
      </button>
    </div>
  );
};

export default AddAllergy;

import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/EditAllergyPopup.css";

const EditAllergyPopup = ({ allergy, onClose, onUpdate }) => {
  const [name, setName] = useState(allergy.name);
  const [severity, setSeverity] = useState(allergy.severity);
  const [notes, setNotes] = useState(allergy.notes);

  const severityOptions = [
    { label: "Mild", value: "Mild" },
    { label: "Moderate", value: "Moderate" },
    { label: "Severe", value: "Severe" },
  ];

  const handleUpdate = () => {
    const updatedAllergy = { ...allergy, name, severity, notes };
    onUpdate(updatedAllergy); // Call the parent component's update function
  };

  return (
    <div className="edit-allergy-popup">
      <div className="edit-allergy-popup-content" >
        {/* Cross button to close the popup */}
        <button className="opd-closeBtn" onClick={onClose}>
          X
        </button>
        <h2>Edit Allergy</h2>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>Allergy Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Allergy Name"
            />
          </div>

          <div className="form-group">
            <label>Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">Select Severity</option>
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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

        <button onClick={handleUpdate} className="update-allergy-btn">
          Update Allergy
        </button>
      </div>
    </div>
  );
};

export default EditAllergyPopup;

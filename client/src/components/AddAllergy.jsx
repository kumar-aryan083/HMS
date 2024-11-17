import React, { useContext, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./styles/AddAllergy.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AddAllergy = ({ opdId }) => {
  const {setNotification} = useContext(AppContext);
  const nav = useNavigate();
  const editorRef = useRef(null);
  const [notes, setNotes] = useState("");
  const [allergyName, setAllergyName] = useState("");
  const [severity, setSeverity] = useState("");

  const handleEditorChange = (value) => {
    setNotes(value);
  };

  const saveContent = async () => {
    console.log(allergyName);
    console.log(severity);
    console.log(notes);
    try {
      const res = await fetch(
        `http://localhost:8000/api/opd/add-allergy/${opdId}`,
        {
          method: "POST",
          headers: {
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
        nav(`/opd/${opdId}`);
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
      <Editor
        apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        initialValue="<p>Remove this and write notes about the allergy.</p>"
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table code help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
      <button onClick={saveContent} className="allergy-btn">
        Add Allergy
      </button>
    </div>
  );
};

export default AddAllergy;

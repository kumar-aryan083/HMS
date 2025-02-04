import React, { useContext, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/OpdAssessment.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const OpdAssessment = ({ opdId }) => {
  const { setNotification } = useContext(AppContext);
  const nav = useNavigate();
  const [content, setContent] = useState("");

  const saveContent = async () => {
    // console.log(content);
    try {
      const res = await fetch(
        `${environment.url}/api/opd/add-assessment/${opdId}`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({ assessmentContent: content }),
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
      console.log("Error saving content:", error);
    }
  };

  return (
    <div className="opd-assessment-container">
      <div className="opd-assessment-header">
        <h3>Add Assessment to this OPD</h3>
      </div>
      <div className="form-group">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="Write assessment for this opd..."
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
      <button onClick={saveContent} className="opd-assessment-btn">
        Add Assessment
      </button>
    </div>
  );
};

export default OpdAssessment;

import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./styles/AddAllergy.css";
import { useNavigate } from "react-router-dom";

const OpdAssessment = ({ opdId, setNotification }) => {
  const nav = useNavigate();
  const editorRef = useRef(null);
  const [content, setContent] = useState("");

  const handleEditorChange = (value) => {
    setContent(value);
  };

  const saveContent = async () => {
    console.log(content);
    try {
        const res = await fetch(`http://localhost:8000/api/opd/add-assessment/${opdId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({ assessmentContent: content }),
        });
        const data = await res.json();
        if (res.ok) {
          setNotification(data.message);
          nav(`/opd/${opdId}`)
        } else {
          setNotification(data.message);
        }
      } catch (error) {
        console.log("Error saving content:", error);
      }
  };

  return (
    <>
      <div className="full-allergy">
        <div className="allergy-header">
          <h3>Add Assessment to this OPD</h3>
        </div>
        {/* Editor component */}
        <Editor
          apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
          onInit={(_evt, editor) => (editorRef.current = editor)}
          initialValue="<p>Remove this and write your assessment.</p>"
          onEditorChange={handleEditorChange} // Corrected onEditorChange prop
          init={{
            height: 800,
            width: 1000,
            menubar: false,
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "code",
              "help",
              "wordcount",
            ],
            toolbar:
              "undo redo | blocks | " +
              "bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | help",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />
        <button onClick={saveContent} className="allergy-btn">
          Add Assessment
        </button>
      </div>
    </>
  );
};

export default OpdAssessment;

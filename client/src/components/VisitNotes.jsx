import React, { useState, useEffect, useContext, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./styles/VisitNotes.css"; // Add your custom styling
import { AppContext } from "../context/AppContext";

const VisitNotes = ({ admissionId }) => {
  const {setNotification} = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const editorRef = useRef(null);

  useEffect(()=>{
    setLoading(false);
  },[])

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    // console.log(newNote);
    try {

      const response = await fetch(
        `http://localhost:8000/api/ipd/${admissionId}/visit-notes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({ note: newNote }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        // console.log(data)
        setNewNote("");
        setNotification(data.message);
        setUpdatedAt(new Date()); 
      } else {
        setNotification("Failed to add new visit note.");
      }
    } catch (err) {
      setNotification("Failed to add new visit note.");
    }
  };

  // Handle note content change
  const handleNoteChange = (value) => {
    setNewNote(value);
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

      <div className="add-note-section">
        <label htmlFor="newNote">Add a New Visit Note:</label>
        <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue="<p>Write dishcarge notes here.</p>"
            onEditorChange={handleNoteChange}
            init={{
              height: 300,
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
        <button type="button" onClick={handleAddNote} className="add-note-btn">
          Add Note
        </button>
      </div>

      <div className="last-updated">
        {updatedAt && <p>Last updated on: {new Date(updatedAt).toLocaleString()}</p>}
      </div>
    </div>
  );
};

export default VisitNotes;

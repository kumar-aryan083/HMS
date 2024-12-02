import React, { useContext, useRef, useState } from 'react';
import './styles/Allergies.css';
import { AppContext } from '../context/AppContext';
import { Editor } from "@tinymce/tinymce-react";

const Allergies = ({ admissionId }) => {
  const {setNotification} = useContext(AppContext);
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  const handleEditorChange = (value) => {
    setContent(value);
  };

  const addAllergy = async (event) => {
    event.preventDefault();
    console.log(content)

    if (!content) {
      setNotification("Write atleast one allergy to add.")
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/ipd/admissions/${admissionId}/allergies`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token')
        },
        body: JSON.stringify({ allergies: content }),
      });

      const data = await response.json();

      if (response.ok) {
        if (editorRef.current) editorRef.current.setContent('');
        setNotification(data.message);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="allergies-container">
      <h2>Allergies</h2>
      <form onSubmit={addAllergy} className="allergy-form">
      <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue="<p>Write allergies here.</p>"
            onEditorChange={handleEditorChange}
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
        <button type="submit" className="allergy-button">Add</button>
      </form>
    </div>
  );
};

export default Allergies;

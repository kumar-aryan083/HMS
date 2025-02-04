import React, { useContext, useState } from "react";
import "./styles/AddTerms.css";
import { Editor } from "@tinymce/tinymce-react";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const AddTerms = () => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    shortName: "",
    text: "",
    type: "",
    isActive: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      text: content, // Set the TinyMCE content to the 'text' field
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Terms and Conditon Added:", formData);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/add-tandc`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
"Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setFormData({
          shortName: "",
          text: "",
          type: "",
          isActive: false,
        });
      } else {
        setNotification("something went wrong");
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  return (
    <div className="add-terms-container">
      <h2>Add Terms & Condition</h2>
      <form className="terms-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Short Name:
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                placeholder="Short Name"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Type:
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="Type"
                required
              />
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="text">Text:</label>
          <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            initialValue="<p>Write text here.</p>"
            onEditorChange={handleEditorChange}
            value={formData.text}
            init={{
              height: 300,
              width: 750,
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
        </div>

        <div className="cb-inpts">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Is Active
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Add Terms & Condition
        </button>
      </form>
    </div>
  );
};

export default AddTerms;

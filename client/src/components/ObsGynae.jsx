import React, { useContext, useRef, useState } from "react";
import "./styles/ObsGynae.css";
import { Editor } from "@tinymce/tinymce-react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ObsGynae = ({admissionId}) => {
  const nav = useNavigate();
  const {setNotification} = useContext(AppContext);
  const [formData, setFormData] = useState({
    pregnancyHistory: "",
    menstrualHistory: "",
    lastMenstrualPeriod: "",
    obstetricHistory: {
      gravidity: "",
      parity: "",
      abortions: "",
      livingChildren: "",
    },
    gynecologicalHistory: {
      papSmearResults: "",
      sexuallyTransmittedInfections: "",
      gynecologicalProcedures: [],
    },
    contraceptiveHistory: {
      method: "",
      duration: "",
    },
    fertilityHistory: {
      fertilityIssues: "",
      treatments: [],
    },
    familyHistory: {
      geneticConditions: "",
      relevantDiseases: "",
    },
    sexualHistory: {
      sexualActivity: false,
      partners: "",
      contraceptiveUse: "",
    },
    menopauseDetails: {
      isMenopausal: false,
      ageAtMenopause: "",
      symptoms: "",
    },
  });
  const [content1, setContent1] = useState("");
  const editorRef1 = useRef(null);
  const [content2, setContent2] = useState("");
  const editorRef2 = useRef(null);

  const handleChange = (e, field, subField) => {
    if (subField) {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subField]: e.target.value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleBooleanChange = (e, field, subField) => {
    const value = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [subField]: value },
    }));
  };
  const handleEditorChange1 = (value) => {
    setContent1(value);
  };
  const handleEditorChange2 = (value) => {
    setContent2(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare the data to be sent
    const dataToSend = {
      pregnancyHistory: content1,
      menstrualHistory: content2,
      lastMenstrualPeriod: formData.lastMenstrualPeriod,
      obstetricHistory: formData.obstetricHistory,
      gynecologicalHistory: formData.gynecologicalHistory,
      contraceptiveHistory: formData.contraceptiveHistory,
      fertilityHistory: formData.fertilityHistory,
      familyHistory: formData.familyHistory,
      sexualHistory: formData.sexualHistory,
      menopauseDetails: formData.menopauseDetails,
      updatedAt: new Date(),
      admissionId: admissionId // assuming you have the admissionId
    };
  
    // Log data to the console (for debugging purposes)
    console.log("Form Data:", dataToSend);
  
    try {
      // Send data to backend using fetch
      const response = await fetch(`http://localhost:8000/api/ipd/${admissionId}/obs-gynae`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(dataToSend), 
      });
      const data = await response.json();
      if (response.ok) {
        // console.log("Data submitted successfully!")
        setNotification(data.message);
        nav(`/ipds/ipd-file/${admissionId}`)
      } else {
        // Handle error (e.g., show an error message)
        // console.error("Failed to submit data.");
        setNotification(data.message);

      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  

  return (
    <form className="obs-gynae-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Obs & Gynae</h3>

      <div className="form-group">
        <label className="form-label">Pregnancy History</label>
        <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRef1.current = editor)}
            initialValue="<p>Remove this and write your content.</p>"
            onEditorChange={handleEditorChange1}
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
      </div>

      <div className="form-group">
        <label className="form-label">Menstrual History</label>
        <Editor
            apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
            onInit={(_evt, editor) => (editorRef2.current = editor)}
            initialValue="<p>Remove this and write your content.</p>"
            onEditorChange={handleEditorChange2}
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
      </div>

      <div className="form-group">
        <label className="form-label">Last Menstrual Period</label>
        <input
          type="date"
          className="form-input"
          value={formData.lastMenstrualPeriod}
          onChange={(e) => handleChange(e, "lastMenstrualPeriod")}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Obstetric History</label>
        <input
          type="number"
          className="form-input"
          placeholder="Gravidity"
          value={formData.obstetricHistory.gravidity}
          onChange={(e) => handleChange(e, "obstetricHistory", "gravidity")}
        />
        <input
          type="number"
          className="form-input"
          placeholder="Parity"
          value={formData.obstetricHistory.parity}
          onChange={(e) => handleChange(e, "obstetricHistory", "parity")}
        />
        <input
          type="number"
          className="form-input"
          placeholder="Abortions"
          value={formData.obstetricHistory.abortions}
          onChange={(e) => handleChange(e, "obstetricHistory", "abortions")}
        />
        <input
          type="number"
          className="form-input"
          placeholder="Living Children"
          value={formData.obstetricHistory.livingChildren}
          onChange={(e) => handleChange(e, "obstetricHistory", "livingChildren")}
        />
      </div>

      <div className="form-group menopause-section">
  <label className="form-label">Menopause Details</label>
  <div className="form-row">
    <label className="form-checkbox-inline">
      <input
        type="checkbox"
        checked={formData.menopauseDetails.isMenopausal}
        onChange={(e) =>
          handleBooleanChange(e, "menopauseDetails", "isMenopausal")
        }
      />
      <span className="checkbox-label">Is Menopausal</span>
    </label>
  </div>

  {formData.menopauseDetails.isMenopausal && (
    <div className="menopause-details">
      <div className="form-group">
        <label className="form-label">Age at Menopause</label>
        <input
          type="number"
          className="form-input"
          placeholder="Enter age at menopause"
          value={formData.menopauseDetails.ageAtMenopause}
          onChange={(e) =>
            handleChange(e, "menopauseDetails", "ageAtMenopause")
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Symptoms</label>
        <select
          className="form-select"
          multiple
          value={formData.menopauseDetails.symptoms.split(", ")}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            ).join(", ");
            handleChange({ target: { value: selected } }, "menopauseDetails", "symptoms");
          }}
        >
          <option value="Hot Flashes">Hot Flashes</option>
          <option value="Night Sweats">Night Sweats</option>
          <option value="Mood Swings">Mood Swings</option>
          <option value="Fatigue">Fatigue</option>
          <option value="Vaginal Dryness">Vaginal Dryness</option>
          <option value="Bone Weakness">Bone Weakness</option>
        </select>
      </div>
    </div>
  )}
</div>


<div className="form-group sexual-history-section">
  <label className="form-label">Sexual History</label>
  <div className="form-row">
    <label className="form-checkbox-inline">
      <input
        type="checkbox"
        checked={formData.sexualHistory.sexualActivity}
        onChange={(e) =>
          handleBooleanChange(e, "sexualHistory", "sexualActivity")
        }
      />
      <span className="checkbox-label">Sexually Active</span>
    </label>
  </div>

  {formData.sexualHistory.sexualActivity && (
    <div className="sexual-history-details">
      <div className="form-row">
      <div className="form-group">
        <label className="form-label">Number of Partners</label>
        <input
          type="number"
          className="form-input"
          placeholder="Enter number of partners"
          value={formData.sexualHistory.partners}
          onChange={(e) =>
            handleChange(e, "sexualHistory", "partners")
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contraceptive Use</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter contraceptive use"
          value={formData.sexualHistory.contraceptiveUse}
          onChange={(e) =>
            handleChange(e, "sexualHistory", "contraceptiveUse")
          }
        />
      </div>
      </div>
      
    </div>
  )}
</div>


      <button type="submit" className="form-button">
        Submit
      </button>
    </form>
  );
};

export default ObsGynae;

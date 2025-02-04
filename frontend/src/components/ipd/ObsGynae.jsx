import React, { useContext, useRef, useState } from "react";
import "./styles/ObsGynae.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { AppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import { environment } from "../../../utlis/environment.js";

const ObsGynae = ({ admissionId }) => {
  const nav = useNavigate();
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    gravida: "",
    para: "",
    maritalHistory: "",
    abortion: "",
    complication: "",
    initalExam: false,
    afp: false,
    gct: false,
    tubal: false,
    gbs: false,
    twentyWeeks: false,
    twentyEightWeeks: false,
    thirtySixWeeks: false,
    thirtyEightWeeks: false,
    fortyWeeks: false,
    ageOfOnset: "",
    menopause: "",
    uterus: "",
    allergies: "",
    pelvicExamination: "",
    rectalExamination: "",
    vaginalExamination: "",
    breastExamination: "",
    cervixExamination: "",
    perAbdomen: "",
    importantFindings: "",
    hours: "",
    show: "",
    findings: "",
    intact: "",
    hoursAgo: "",
    abdominalPalpatation: "",
    heightOfFundus: "",
    uterusCondition: "",
    presentation: "",
    position: "",
    pelvisRelationship: "",
    positionRate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleEditorChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Form Data Submitted:", formData);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/obs-gynae`,
        {
          method: "PATCH",
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
        setFormData({
          gravida: "",
          para: "",
          maritalHistory: "",
          abortion: "",
          complication: "",
          initalExam: false,
          afp: false,
          gct: false,
          tubal: false,
          gbs: false,
          twentyWeeks: false,
          twentyEightWeeks: false,
          thirtySixWeeks: false,
          thirtyEightWeeks: false,
          fortyWeeks: false,
          ageOfOnset: "",
          menopause: "",
          uterus: "",
          allergies: "",
          pelvicExamination: "",
          rectalExamination: "",
          vaginalExamination: "",
          breastExamination: "",
          cervixExamination: "",
          perAbdomen: "",
          importantFindings: "",
          hours: "",
          show: "",
          findings: "",
          intact: "",
          hoursAgo: "",
          abdominalPalpatation: "",
          heightOfFundus: "",
          uterusCondition: "",
          presentation: "",
          position: "",
          pelvisRelationship: "",
          positionRate: "",
        });
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  return (
    <div className="obs-gynae-container">
      <h2>Obs/Gynae Examination</h2>
      <div className="obs-gynae-form">
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Gravida:</label>
              <input
                type="text"
                name="gravida"
                value={formData.gravida}
                onChange={handleInputChange}
                placeholder="Write Gravida here"
              />
            </div>

            <div className="form-group">
              <label>Para:</label>
              <input
                type="text"
                name="para"
                value={formData.para}
                onChange={handleInputChange}
                placeholder="Write Para here"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Marital History:</label>
            <ReactQuill
              theme="snow"
              value={formData.maritalHistory}
              onChange={(value) => handleEditorChange("maritalHistory", value)}
              placeholder="Write about the marital history..."
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
                  ["link", "image", "video"],

                  // Miscellaneous
                  ["clean"],
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

          <div className="form-group">
            <label>Abortion:</label>
            <ReactQuill
              theme="snow"
              value={formData.abortion}
              onChange={(value) => handleEditorChange("abortion", value)}
              placeholder="Write about the abortion..."
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

          <div className="form-group">
            <label>Complications in present pregenancy:</label>
            <ReactQuill
              theme="snow"
              value={formData.complication}
              onChange={(value) => handleEditorChange("complication", value)}
              placeholder="Write about the complication..."
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

          <div className="quick-checklist">
            <h3>Quick Checklist</h3>
            <div className="checkbox-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="initalExam"
                  checked={formData.initalExam}
                  onChange={handleCheckboxChange}
                />
                <label>Initial Exam</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="afp"
                  checked={formData.afp}
                  onChange={handleCheckboxChange}
                />
                <label>AFP Initial Labs Obtained</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="gct"
                  checked={formData.gct}
                  onChange={handleCheckboxChange}
                />
                <label>GCT</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="tubal"
                  checked={formData.tubal}
                  onChange={handleCheckboxChange}
                />
                <label>Tubal</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="gbs"
                  checked={formData.gbs}
                  onChange={handleCheckboxChange}
                />
                <label>GBS</label>
              </div>
            </div>
          </div>

          <div className="quick-checklist">
            <h3>PN RE. to L&D</h3>
            <div className="checkbox-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="twentyWeeks"
                  checked={formData.twentyWeeks}
                  onChange={handleCheckboxChange}
                />
                <label>20 weeks</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="twentyEightWeeks"
                  checked={formData.twentyEightWeeks}
                  onChange={handleCheckboxChange}
                />
                <label>28 weeks</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="thirtySixWeeks"
                  checked={formData.thirtySixWeeks}
                  onChange={handleCheckboxChange}
                />
                <label>36 weeks</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="thirtyEightWeeks"
                  checked={formData.thirtyEightWeeks}
                  onChange={handleCheckboxChange}
                />
                <label>38 weeks</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="fortyWeeks"
                  checked={formData.fortyWeeks}
                  onChange={handleCheckboxChange}
                />
                <label>40 weeks</label>
              </div>
            </div>
          </div>
          <div className="obs-mh fg-group">
            <label>Menstrual History</label>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Age of Onset:</label>
              <input
                type="text"
                name="ageOfOnset"
                value={formData.ageOfOnset}
                onChange={handleInputChange}
                placeholder="Age of Onset here"
              />
            </div>
            <div className="form-group">
              <label>Menopause:</label>
              <input
                type="text"
                name="menopause"
                value={formData.menopause}
                onChange={handleInputChange}
                placeholder="Menopause here"
              />
            </div>
            <div className="form-group">
              <label>Uterus (in weeks):</label>
              <input
                type="text"
                name="uterus"
                value={formData.uterus}
                onChange={handleInputChange}
                placeholder="Uterus (in weeks) here"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Allergies:</label>
            <ReactQuill
              theme="snow"
              value={formData.allergies}
              onChange={(value) => handleEditorChange("allergies", value)}
              placeholder="Write about the allergies..."
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
          <div className="form-group">
            <label>Pelvic Examination:</label>
            <ReactQuill
              theme="snow"
              value={formData.pelvicExamination}
              onChange={(value) =>
                handleEditorChange("pelvicExamination", value)
              }
              placeholder="Write about the pelvic examination..."
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

          <div className="form-group">
            <label>Rectal Examination:</label>
            <ReactQuill
              theme="snow"
              value={formData.rectalExamination}
              onChange={(value) =>
                handleEditorChange("rectalExamination", value)
              }
              placeholder="Write about the rectal examination..."
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

          <div className="form-group">
            <label>Vaginal Examination:</label>
            <ReactQuill
              theme="snow"
              value={formData.vaginalExamination}
              onChange={(value) =>
                handleEditorChange("vaginalExamination", value)
              }
              placeholder="Write about the vaginal examination..."
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
          <div className="form-group">
            <label>Breast Examination:</label>
            <ReactQuill
              theme="snow"
              value={formData.breastExamination}
              onChange={(value) =>
                handleEditorChange("breastExamination", value)
              }
              placeholder="Write about the breast examination..."
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
          <div className="form-group">
            <label>Cervix Examination:</label>
            <ReactQuill
              theme="snow"
              value={formData.cervixExamination}
              onChange={(value) =>
                handleEditorChange("cervixExamination", value)
              }
              placeholder="Write about the cervix examination..."
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
          <div className="form-group fg-group">
            <label>Per Abdomen:</label>
            <ReactQuill
              theme="snow"
              value={formData.perAbdomen}
              onChange={(value) => handleEditorChange("perAbdomen", value)}
              placeholder="Write about per abdomen..."
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

          <div className="obs-mh fg-group">
            <label>General Examination</label>
          </div>
          <div className="form-group fg-group">
            <label>Important Findings:</label>
            <ReactQuill
              theme="snow"
              value={formData.importantFindings}
              onChange={(value) =>
                handleEditorChange("importantFindings", value)
              }
              placeholder="Write about important findings..."
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
          <div className="obs-mh fg-group">
            <label>Onset of Pain</label>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Hours:</label>
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                placeholder="Write Hours here"
              />
            </div>

            <div className="form-group">
              <label>Show:</label>
              <input
                type="text"
                name="show"
                value={formData.show}
                onChange={handleInputChange}
                placeholder="Write show here"
              />
            </div>
            <div className="form-group">
              <label>Important Findings:</label>
              <input
                type="text"
                name="findings"
                value={formData.findings}
                onChange={handleInputChange}
                placeholder="Write important findings here"
              />
            </div>
          </div>
          <div className="obs-mh fg-group">
            <label>Membranes</label>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Intact/Ruptured:</label>
              <input
                type="text"
                name="intact"
                value={formData.intact}
                onChange={handleInputChange}
                placeholder="Write Intact/Ruptured here"
              />
            </div>

            <div className="form-group">
              <label>Hours ago:</label>
              <input
                type="text"
                name="hoursAgo"
                value={formData.hoursAgo}
                onChange={handleInputChange}
                placeholder="Write Hours ago here"
              />
            </div>
          </div>
          <div className="form-group fg-group">
            <label>Abdominal Palpatation:</label>
            <ReactQuill
              theme="snow"
              value={formData.abdominalPalpatation}
              onChange={(value) =>
                handleEditorChange("abdominalPalpatation", value)
              }
              placeholder="Write about Abdominal palpatation..."
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
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Height of Fundus:</label>
              <input
                type="text"
                name="heightOfFundus"
                value={formData.heightOfFundus}
                onChange={handleInputChange}
                placeholder="Write Height of Fundus here"
              />
            </div>

            <div className="form-group">
              <label>Condition of uterus:</label>
              <input
                type="text"
                name="uterusCondition"
                value={formData.uterusCondition}
                onChange={handleInputChange}
                placeholder="Condition of uterus here"
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Presentation:</label>
              <input
                type="text"
                name="presentation"
                value={formData.presentation}
                onChange={handleInputChange}
                placeholder="Presentation here"
              />
            </div>

            <div className="form-group">
              <label>Position:</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Write position here"
              />
            </div>
          </div>

          <div className="form-group fg-group">
            <label>Relationship of presenting part to pelvis:</label>
            <ReactQuill
              theme="snow"
              value={formData.pelvisRelationship}
              onChange={(value) =>
                handleEditorChange("pelvisRelationship", value)
              }
              placeholder="Write about Relationship of presenting part to pelvis..."
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
          <div className="form-group fg-group">
            <label>F.H Position & Rate:</label>
            <ReactQuill
              theme="snow"
              value={formData.positionRate}
              onChange={(value) => handleEditorChange("positionRate", value)}
              placeholder="Write about F.H Position & Rate..."
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

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ObsGynae;

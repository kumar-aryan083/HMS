import React, { useContext, useRef, useState, useEffect } from "react";
import "./styles/Allergies.css";
import { AppContext } from "../../context/AppContext.jsx";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { environment } from "../../../utlis/environment.js";

const Allergies = ({ admissionId, toggleAllergyPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const [content, setContent] = useState("");
  const [allergyName, setAllergyName] = useState("");
  const [allergyType, setAllergyType] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [allergyDate, setAllergyDate] = useState("");
  const [allergyTime, setAllergyTime] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    // Fetch doctors when the component loads
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          `${environment.url}/api/employee/get-doctors`,
          {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setDoctors(data.doctors); // Assuming the API returns a list of doctors
        } else {
          setNotification("Failed to fetch doctors.");
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setNotification("Error fetching doctor list.");
      }
    };
    fetchDoctors();
  }, []);

  const handleDoctorInput = (e) => {
    const searchValue = e.target.value;
    setDoctorName(searchValue);
    if (searchValue.length > 2) {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setDoctorName(doctor.name);
    setDoctorId(doctor._id);
    setFilteredDoctors([]);
  };

  const addAllergy = async (event) => {
    event.preventDefault();

    // console.log({
    //   allergyName,
    //   allergyType,
    //   content,
    //   doctorId,
    //   doctorName,
    //   allergyDate,
    //   allergyTime,
    // });

    if (
      !allergyName ||
      !allergyType ||
      !content ||
      !doctorId ||
      !allergyDate ||
      !allergyTime
    ) {
      setNotification("All fields are required to add an allergy.");
      return;
    }

    try {
      const response = await fetch(
        `${environment.url}/api/ipd/admissions/${admissionId}/allergies`,
        {
          method: "PATCH",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            allergyName,
            allergyType,
            notes: content,
            doctorId,
            dateTime: `${allergyDate}T${allergyTime}`,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotification(data.message);
        toggleAllergyPopup();
        onAssign();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error adding allergy:", error);
    }
  };

  return (
    <div className="allergies-container">
      <h2>Add Allergies</h2>
      <form onSubmit={addAllergy} className="allergy-form">
        <div className="form-row allergies-row-gap">
          <div className="form-group">
            <label htmlFor="allergy-name">Allergy Name:</label>
            <input
              id="allergy-name"
              type="text"
              value={allergyName}
              onChange={(e) => setAllergyName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="allergy-type">Allergy Type:</label>
            <select
              id="allergy-type"
              value={allergyType}
              onChange={(e) => setAllergyType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="Food">Food</option>
              <option value="Drug">Drug</option>
              <option value="Environmental">Environmental</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-row allergies-row-gap">
          <div className="form-group">
            <label htmlFor="doctor-name">Doctor Name:</label>
            <input
              id="doctor-name"
              type="text"
              value={doctorName}
              onChange={handleDoctorInput}
              autoComplete="off"
              required
            />
            {filteredDoctors.length > 0 && (
              <ul className="doctor-suggestions">
                {filteredDoctors.map((doctor) => (
                  <li
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    {doctor.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="allergy-date">Date:</label>
            <input
              id="allergy-date"
              type="date"
              value={allergyDate}
              onChange={(e) => setAllergyDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="allergy-time">Time:</label>
            <input
              id="allergy-time"
              type="time"
              value={allergyTime}
              onChange={(e) => setAllergyTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="allergies-notes">Notes</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
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

        <button type="submit" className="allergy-button">
          Add Allergy
        </button>
      </form>
    </div>
  );
};

export default Allergies;

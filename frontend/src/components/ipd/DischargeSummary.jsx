import React, { useState, useEffect, useRef, useContext } from "react";
import "./styles/DischargeSummary.css";
import "./styles/PhysicalExamination.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { AppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import { environment } from "../../../utlis/environment.js";
import { useReactToPrint } from "react-to-print";
import DischargeSummaryPrint from "./DischargeSummaryPrint.jsx";

const DischargeSummary = ({ admissionId, billPaid }) => {
  const nav = useNavigate();
  const { setNotification } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const documentRef = useRef();
  const [error, setError] = useState(null);
  const handlePrint = useReactToPrint({
    contentRef: documentRef,
  });
  const [dischargeSummary, setDischargeSummary] = useState({
    dischargeDate: "",
    dischargeTime: "",
    numberOfDays: "",
    statusAtDischarge: "Recovered",
    dischargeNotes: "",
    finalDiagnosis: "",
    // medications: "",
    followUpInstructions: "",
    dischargingDoctor: "",
    dischargeMode: "",
    complications: "",
    patientCondition: "",
    keyInterventions: "",
    dietaryInstructions: "",
    activityRecommendations: "",
    woundCareInstructions: "",
    emergencyCareHow: "",
    emergencyCareWhen: "",
  });
const [assignedMedicine, setAssignedMedicine]= useState("")
  const [patientData, setPatientData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [diagnosisContent, setDiagnosisContent] = useState("");
  const [notesContent, setNotesContent] = useState("");
  const [followupContent, setFollowupContent] = useState("");
  const [complications, setComplications] = useState("");
  const [patientCondition, setPatientCondition] = useState("");
  const [keyInterventions, setKeyInterventions] = useState("");
  const [dietaryInstructions, setDietaryInstructions] = useState("");
  const [activityRecommendations, setActivityRecommendations] = useState("");
  const [woundCareInstructions, setWoundCareInstructions] = useState("");
  const [emergencyCareWhen, setEmergencyCareWhen] = useState("");
  const [emergencyCareHow, setEmergencyCareHow] = useState("");
  const [medicationList, setMedicationList] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  const [ipdData, setIpdData] = useState([]);

  const fetchIPDData = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/ipd/get-ipd/${admissionId}`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        // console.log(data);
        setIpdData(data);
      } else {
        setError(data.message || "Failed to fetch IPD data.");
      }
    } catch (err) {
      setError("Error fetching IPD data.");
    }
    setLoading(false);
  };

  // Frequency options
  const frequencyOptions = [
    "Once a day",
    "Twice a day",
    "Every 8 hours",
    "Every 12 hours",
    "Every 24 hours",
    "As needed",
  ];
  useEffect(() => {
    // console.log(billPaid)
    // if (!billPaid) {
    //   nav(`/ipds/ipd-file/${admissionId}/ipd-billing`);
    //   setNotification("Pay all the dues to get discharge.");
    // }
    fetchMedications();
    fetchIPDData();
  }, []);
  const fetchMedications = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/pharmacy/get-medicines`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch medications");
      }
      const data = await response.json();
      // console.log("medications fetched:", data);
      setMedicationList(data.items); // Store medications list in state
    } catch (err) {
      console.error("Error fetching medications:", err.message);
    }
  };

  // Fetching doctors list for selection
  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/employee/get-doctors`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors);
      } else {
        setError("Failed to fetch doctors.");
      }
    } catch (err) {
      setError("Failed to fetch doctors.");
    }
  };

  // Fetch discharge summary data
  const fetchDischargeSummary = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-discharge-summary`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        // console.log("discharge summary submitted", data.dischargeSummary);
        // Set discharge summary if data exists, otherwise reset to initial state
        setDischargeSummary(
          data.dischargeSummary || {
            dischargeDate: "",
            dischargeTime: "",
            numberOfDays: "",
            statusAtDischarge: "Recovered",
            dischargeNotes: "",
            finalDiagnosis: "",
            // medications: "",
            followUpInstructions: "",
            dischargingDoctor: "",
            complications: "",
            patientCondition: "",
            keyInterventions: "",
            dietaryInstructions: "",
            activityRecommendations: "",
            woundCareInstructions: "",
            dischargeMode: "",
            emergencyCareHow: "",
            emergencyCareWhen: "",
          }
        );
        setAssignedMedicine(data.dischargeSummary.medications);
        setDiagnosisContent(data.dischargeSummary.finalDiagnosis || "");
        setNotesContent(data.dischargeSummary.dischargeNotes || "");
        setFollowupContent(data.dischargeSummary.followUpInstructions || "");
        setComplications(data.dischargeSummary.complications || "");
        setPatientCondition(data.dischargeSummary.patientCondition || "");
        setKeyInterventions(data.dischargeSummary.keyInterventions || "");
        setDietaryInstructions(data.dischargeSummary.dietaryInstructions || "");
        setActivityRecommendations(
          data.dischargeSummary.activityRecommendations || ""
        );
        setWoundCareInstructions(
          data.dischargeSummary.woundCareInstructions || ""
        );
        setEmergencyCareHow(data.dischargeSummary.emergencyCareHow || "");
        setEmergencyCareWhen(data.dischargeSummary.emergencyCareWhen || "");
      } else {
        setError("Failed to fetch discharge summary data.");
      }
    } catch (err) {
      setError("Failed to fetch discharge summary data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle changes in form fields
  const handleChange = (name, value) => {
    setDischargeSummary((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Add new procedure or medication
  const addNewItem = (name) => {
    setDischargeSummary((prevState) => ({
      ...prevState,
      [name]: [...prevState[name], { name: "", dosage: "", frequency: "" }],
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...dischargeSummary.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };

    if (field === "name" && value.length >= 2) {
      const filtered = medicationList.filter((med) =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines([]);
    }

    setDischargeSummary((prevState) => ({
      ...prevState,
      medications: updatedMedications,
    }));
  };

  const handleSelectMedication = (index, selectedMed) => {
    const updatedMedications = [...dischargeSummary.medications];
    updatedMedications[index].name = selectedMed.name;
    setFilteredMedicines([]); // Clear suggestions after selection
    setDischargeSummary((prevState) => ({
      ...prevState,
      medications: updatedMedications,
    }));
  };

  // Remove a medication field
  const removeMedicationField = (index) => {
    const updatedMedications = dischargeSummary.medications.filter(
      (_, idx) => idx !== index
    );
    setDischargeSummary((prevState) => ({
      ...prevState,
      medications: updatedMedications,
    }));
  };

  // Submit the form to update the discharge summary
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the updated discharge summary data
    const updatedData = {
      dischargeSummary: {
        medications: assignedMedicine,
        // medications: dischargeSummary.medications.map((med) => ({
        //   name: med.name,
        //   dosage: med.dosage,
        //   frequency: med.frequency,
        // })),
        dischargeDate: dischargeSummary.dischargeDate,
        dischargeTime: dischargeSummary.dischargeTime,
        numberOfDays: dischargeSummary.numberOfDays,
        statusAtDischarge: dischargeSummary.statusAtDischarge,
        dischargingDoctor: dischargeSummary.dischargingDoctor,
        finalDiagnosis: diagnosisContent,
        dischargeNotes: notesContent,
        followUpInstructions: followupContent,
        patientDetails: patientData,
        dischargeMode: dischargeSummary.dischargeMode,
        complications: complications,
        patientCondition: patientCondition,
        keyInterventions: keyInterventions,
        dietaryInstructions: dietaryInstructions,
        activityRecommendations: activityRecommendations,
        woundCareInstructions: woundCareInstructions,
        emergencyCareWhen: emergencyCareWhen,
        emergencyCareHow: emergencyCareHow,
      },
    };

    // Print the filled data to the console
    // console.log("Filled Data for Discharge Summary:", updatedData);

    try {
      const res = await fetch(
        `${environment.url}/api/ipd/admissions/${admissionId}/discharge-summary`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({ ...updatedData }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setDischargeSummary(updatedData.dischargeSummary);
        await fetchDischargeSummary();
        await fetchIPDData();
        handlePrint();
        nav(`/ipds/ipd-file/${admissionId}`);
      }
    } catch (err) {
      setError("Failed to update discharge summary.");
    }
  };

  const fetchPatientDetails = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/patient/get-patient-from-admission-id?admissionId=${admissionId}`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("fetch patientData for bill print",data.patient);
        setPatientData(data.patient);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchIpdDetails = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/get-ipd/${admissionId}`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(
        //   "this is the data from which we have to get Patient details",
        //   data
        // );
        setPatientData(data.patientId);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchPatientDetails();
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchDischargeSummary();
  }, [admissionId]);

  if (loading) {
    return <p>Loading discharge summary...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <>
      <div className="discharge-summary-container">
        <h2>Discharge Summary</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label htmlFor="dischargeDate">Discharge Date:</label>
              <input
                type="date"
                id="dischargeDate"
                value={dischargeSummary.dischargeDate}
                onChange={(e) => handleChange("dischargeDate", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dischargeTime">Discharge Time:</label>
              <input
                type="time"
                id="dischargeTime"
                value={dischargeSummary.dischargeTime}
                onChange={(e) => handleChange("dischargeTime", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="statusAtDischarge">Status at Discharge:</label>
              <select
                id="statusAtDischarge"
                value={dischargeSummary.statusAtDischarge}
                onChange={(e) =>
                  handleChange("statusAtDischarge", e.target.value)
                }
              >
                <option value="Recovered">Recovered</option>
                <option value="Referred">Referred</option>
                <option value="Deceased">Deceased</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dischargingDoctor">Mode of Discharge:</label>
              <select
                id="dischargeMode"
                value={dischargeSummary.dischargeMode}
                onChange={(e) => handleChange("dischargeMode", e.target.value)}
              >
                <option value="">Select Mode of Discharge</option>
                <option value="home">Home</option>
                <option value="transferred to another facility">
                  Transferred to another facility
                </option>
                <option value="against medical advice">
                  Against medical advice
                </option>
              </select>
            </div>
          </div>

          <div className="form-row fg-group">
            <div className="form-group" style={{maxWidth: "230px", margin: "0", }}>
              <label htmlFor="dischargingDoctor" style={{width: "fit-content"}}>Discharging Doctor:</label>
              <select
                id="dischargingDoctor"
                value={dischargeSummary.dischargingDoctor}
                onChange={(e) =>
                  handleChange("dischargingDoctor", e.target.value)
                }
                // style={{width: "fit-content"}}
              >
                <option value="">Select Doctor</option>
                {doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </option>
                  ))
                ) : (
                  <option>No doctor available</option>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label>Number of Days stayed</label>
              <input
                type="text"
                style={{ width: "250px" }}
                name="numberOfDays"
                value={dischargeSummary.numberOfDays}
                onChange={(e) => handleChange("numberOfDays", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group fg-group">
            {/* <label htmlFor="medications">Medications:</label>
            <textarea name="medications" rows={8} onChange={(e)=> setAssignedMedicine(e.target.value)} value={assignedMedicine} placeholder="Write all the medications" style={{outline: "none"}} /> */}

            {/* {dischargeSummary.medications.map((medication, index) => (
              <div key={index} className="medication-input-row">
                <input
                  type="text"
                  placeholder="Medication Name"
                  value={medication.name}
                  onChange={(e) =>
                    handleMedicationChange(index, "name", e.target.value)
                  }
                />
                {filteredMedicines.length > 0 && (
                  <ul
                    className="medicine-suggestions"
                    style={{ position: "absolute", top: "52%", margin: "0" }}
                  >
                    {filteredMedicines.map((med) => (
                      <li
                        key={med._id}
                        onClick={() => handleSelectMedication(index, med)}
                      >
                        {med.name}
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  type="text"
                  placeholder="Dosage"
                  value={medication.dosage}
                  onChange={(e) =>
                    handleMedicationChange(index, "dosage", e.target.value)
                  }
                />
                <select
                  value={medication.frequency}
                  onChange={(e) =>
                    handleMedicationChange(index, "frequency", e.target.value)
                  }
                >
                  <option value="">Select Frequency</option>
                  {frequencyOptions.map((freq, idx) => (
                    <option key={idx} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeMedicationField(index)}
                  className="remove-btn"
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-btn"
              onClick={() => addNewItem("medications")}
            >
              +
            </button> */}
          </div>
          <div className="form-group">
            <label htmlFor="finalDiagnosis">Medications:</label>
            <ReactQuill
              theme="snow"
              value={assignedMedicine}
              onChange={setAssignedMedicine}
              placeholder="Write all the medicines..."
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

          <h2 className="ds-head">Instructions</h2>

          {/* <div className="form-group">
            <label htmlFor="dischargeNotes">Discharge Notes:</label>
            <ReactQuill
              theme="snow"
              value={notesContent}
              onChange={setNotesContent}
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
          </div> */}

          <div className="form-group">
            <label htmlFor="finalDiagnosis">Diagnosis:</label>
            <ReactQuill
              theme="snow"
              value={diagnosisContent}
              onChange={setDiagnosisContent}
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
          {/* <div className="form-group">
            <label htmlFor="complications">Complications (if any):</label>
            <ReactQuill
              theme="snow"
              value={complications}
              onChange={setComplications}
              placeholder="Write Complications (if any)..."
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
          </div> */}
          {/* <h2 className="ds-head">Summary of Treatment and Progress</h2> */}
          {/* <div className="form-group">
            <label htmlFor="patientCondition">
              Details of the patient's condition during hospitalization:
            </label>
            <ReactQuill
              theme="snow"
              value={patientCondition}
              onChange={setPatientCondition}
              placeholder="Write patient's condition during hospitalization...."
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
          </div> */}
          <div className="form-group">
            <label htmlFor="patientCondition">Presenting Complaints:</label>
            <ReactQuill
              theme="snow"
              value={keyInterventions}
              onChange={setKeyInterventions}
              placeholder="Write Presenting Complaints....."
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
            <label htmlFor="dietaryInstructions">Past History:</label>
            <ReactQuill
              theme="snow"
              value={dietaryInstructions}
              onChange={setDietaryInstructions}
              placeholder="Write Past History..."
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
            <label htmlFor="activityRecommendations">
              General Physical & Systemic Examination:
            </label>
            <ReactQuill
              theme="snow"
              value={activityRecommendations}
              onChange={setActivityRecommendations}
              placeholder="Write General Physical & Systemic Examination..."
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
            <label htmlFor="woundCareInstructions">
              Procedure / Operation Detail:
            </label>
            <ReactQuill
              theme="snow"
              value={woundCareInstructions}
              onChange={setWoundCareInstructions}
              placeholder="Write Procedure / Operation Detail..."
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
            <label htmlFor="woundCareInstructions">
              Treatment and Course During Hospitalization:
            </label>
            <ReactQuill
              theme="snow"
              value={emergencyCareWhen}
              onChange={setEmergencyCareWhen}
              placeholder="Write Treatment and Course During Hospitalization..."
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
            <label htmlFor="woundCareInstructions">
              Where to seek Emergency Care:
            </label>
            <ReactQuill
              theme="snow"
              value={emergencyCareHow}
              onChange={setEmergencyCareHow}
              placeholder="Write where to Seek Emergency Care..."
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
            <label htmlFor="followUpInstructions">
              Follow Up Instructions:
            </label>
            <ReactQuill
              theme="snow"
              value={followupContent}
              onChange={setFollowupContent}
              placeholder="Write notes about the Followup..."
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

          <button type="submit" disabled={loading}>
            Save Discharge Summary
          </button>
        </form>
      </div>

      {/* print discharge summary */}
      <DischargeSummaryPrint
        patientData={patientData}
        dischargeSummary={dischargeSummary}
        documentRef={documentRef}
        ipdData={ipdData}
      />
    </>
  );
};

export default DischargeSummary;

import React, { useContext, useEffect, useState } from "react";
import "./styles/AssignMedicine.css";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";

const AssignMedicine = ({ opdId, togglePopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const [numMedications, setNumMedications] = useState(3);
  const [medications, setMedications] = useState(
    Array.from({ length: 3 }, () => ({
      name: "",
      dosage: "",
      frequency: "",
    }))
  );
  const [medicationList, setMedicationList] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const frequencyOptions = [
    { label: "Once a day (1 0 0)", value: "1 0 0" },
    { label: "Twice a day (1 1 0)", value: "1 1 0" },
    { label: "Three times a day (1 1 1)", value: "1 1 1" },
    { label: "Only morning (1 0 0)", value: "1 0 0" },
    { label: "Only afternoon (0 1 0)", value: "0 1 0" },
    { label: "Only evening (0 0 1)", value: "0 0 1" },
    { label: "Every 8 hours (1 1 1)", value: "1 1 1" },
    { label: "Every 12 hours (1 0 1)", value: "1 0 1" },
    { label: "As needed (0 0 0)", value: "0 0 0" },
  ];

  // Fetch medication list when the component mounts
  useEffect(() => {
    fetchMedications();
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
      // console.log("medicine fetched from pharmacy", data);
      setMedicationList(data.items); // Store medications list in state
    } catch (err) {
      console.error("Error fetching medications:", err.message);
    }
  };

  const addMedicationField = () => {
    setNumMedications(numMedications + 1);
    setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
  };

  const removeMedicationField = () => {
    if (numMedications > 1) {
      setNumMedications(numMedications - 1);
      setMedications(medications.slice(0, -1));
    }
  };

  // Handle input change for medication name and other fields
  const handleInputChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;

    if (field === "name" && value.length > 2) {
      const filtered = medicationList.filter((med) =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered);
      setActiveIndex(index); // Track which input is active
    } else {
      setFilteredMedicines([]);
      setActiveIndex(null);
    }

    setMedications(updatedMedications);
  };

  // Handle selecting a medication from suggestions
  const handleMedicationSelect = (index, selectedMedicine) => {
    const updatedMedications = [...medications];
    updatedMedications[index].name = selectedMedicine.name;
    setMedications(updatedMedications);
    setFilteredMedicines([]); // Clear suggestions after selection
  };

  const handleAssignMedicine = async (e) => {
    e.preventDefault();
    // console.log(medications); // Log the medications array
    try {
      const res = await fetch(
        `${environment.url}/api/opd/assign-medicine/${opdId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(medications),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setNotification(data.message);
        onAssign();
        togglePopup();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error assigning medicine:", error);
    }
  };

  return (
    <div className="medication-component">
      <h2>Assign Medications</h2>
      {medications.map((med, index) => (
        <div key={index} className="medication-input">
          <div className="med-inpts">
            <input
              type="text"
              placeholder="Name of Medicine"
              value={med.name}
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
            />
            {/* Show filtered medication suggestions */}
            {filteredMedicines.length > 0 &&
              index === activeIndex &&
              med.name && (
                <ul className="medicine-suggestions">
                  {filteredMedicines.map((medicine) => (
                    <li
                      key={medicine._id}
                      onClick={() => handleMedicationSelect(index, medicine)}
                    >
                      {medicine.name}
                    </li>
                  ))}
                </ul>
              )}
            <input
              type="text"
              placeholder="Dosage"
              value={med.dosage}
              onChange={(e) =>
                handleInputChange(index, "dosage", e.target.value)
              }
            />
            <select
              value={med.frequency}
              onChange={(e) =>
                handleInputChange(index, "frequency", e.target.value)
              }
            >
              <option value="">Select Frequency</option>
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <div className="mc-top">
        <button onClick={addMedicationField}>+</button>
        <button onClick={removeMedicationField}>-</button>
      </div>
      <button onClick={handleAssignMedicine} className="assign-med-btn">
        Assign Medicine
      </button>
    </div>
  );
};

export default AssignMedicine;

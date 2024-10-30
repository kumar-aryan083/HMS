import React, { useEffect, useState } from "react";
import "./styles/AssignMedicine.css";

const AssignMedicine = ({ opdId, setNotification, user }) => {
  const [numMedications, setNumMedications] = useState(3);
  const [medications, setMedications] = useState(
    Array.from({ length: 3 }, () => ({
      name: "",
      dosage: "",
      frequency: "",
    }))
  );

  const addMedicationField = () => {
    setNumMedications(numMedications + 1);
    setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
  };
  const removeMedicationField = ()=>{
    if (numMedications > 1) { // Prevent removing all fields
      setNumMedications(numMedications - 1);
      setMedications(medications.slice(0, -1));
    }
  }

  const handleInputChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const handleAssignMedicine = async (e) => {
    e.preventDefault();
    console.log(medications); // Log the medications array
    try {
      const res = await fetch(
        `http://localhost:8000/api/opd/assign-medicine/${opdId}`,
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
        console.log(data);
        setNotification(data.message);
        setNumMedications(3);
        setMedications(
          Array.from({ length: 3 }, () => ({
            name: "",
            dosage: "",
            frequency: "",
          }))
        );
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
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
                onChange={(e) =>
                  handleInputChange(index, "name", e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Dosage"
                value={med.dosage}
                onChange={(e) =>
                  handleInputChange(index, "dosage", e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Frequency"
                value={med.frequency}
                onChange={(e) =>
                  handleInputChange(index, "frequency", e.target.value)
                }
                required
              />
          </div>
        </div>
      ))}
      <div className="mc-top">
        <button onClick={addMedicationField}>+</button>
        <button onClick={removeMedicationField}>-</button>
      </div>
        <button onClick={handleAssignMedicine} className="assign-med-btn">Assign Medicine</button>
    </div>
  );
};

export default AssignMedicine;

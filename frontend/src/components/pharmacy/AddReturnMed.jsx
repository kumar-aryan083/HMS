import React, { useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";

const AddReturnMed = ({
  isOpen,
  onClose,
  onAddReturnMed,
  patients,
  medicines,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    returnDate: "",
    medicines: [],
  });
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [medicineInputs, setMedicineInputs] = useState([
    {
      medicineName: "",
      medicineId: "",
      quantity: 1,
      buyPrice: 0,
      sellPrice: 0,
      batchNumber: "",
      expiry: "",
      companyName: "",
      amount: "",
      filteredMedicines: [],
    },
  ]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  useEffect(() => {
    // fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handlePatientInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      patientName: value,
    }));

    if (value.length >= 3) {
      const filtered = patients.filter((patient) =>
        patient.patientName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setForm((prevData) => ({
      ...prevData,
      patientId: patient._id,
      patientName: `${patient.patientName}`,
    }));
    setFilteredPatients([]);
  };

  // Handle medicine input and filtering
  const handleMedicineInput = (index, e) => {
    const { value } = e.target;
    const updatedMedicineInputs = [...medicineInputs];
    updatedMedicineInputs[index].medicineName = value;

    if (value.length >= 2) {
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(value.toLowerCase())
      );
      // console.log("Filtered Medicines:", filtered); // Check the filtered result
      updatedMedicineInputs[index].filteredMedicines = filtered;
    } else {
      updatedMedicineInputs[index].filteredMedicines = [];
    }

    setMedicineInputs(updatedMedicineInputs);
  };

  // Handle medicine selection from suggestions
  const handleMedicineSelect = (index, selectedMedicine) => {
    // console.log("selected medicine", selectedMedicine)
    const updatedMedicineInputs = [...medicineInputs];
    updatedMedicineInputs[index] = {
      medicineName: selectedMedicine.name,
      medicineId: selectedMedicine._id,
      quantity: 1, // default quantity
      buyPrice: selectedMedicine.buyPrice,
      sellPrice: selectedMedicine.pricePerUnit,
      batchNumber: selectedMedicine.batchNumber,
      expiry: selectedMedicine.expiryDate,
      companyName: selectedMedicine.companyName,
      amount: selectedMedicine.amount, // Set initial amount based on sellPrice
      filteredMedicines: [], // Clear suggestions after selection
    };

    setMedicineInputs(updatedMedicineInputs);
  };

  // Add new medicine input field
  const addMedicineInput = () => {
    setMedicineInputs([
      ...medicineInputs,
      {
        medicineName: "",
        medicineId: "",
        quantity: 1,
        buyPrice: 0,
        sellPrice: 0,
        batchNumber: "",
        expiry: "",
        companyName: "",
        amount: "",
        filteredMedicines: [],
      },
    ]);
  };

  // Remove medicine input field
  const removeMedicineInput = (index) => {
    const updatedMedicineInputs = [...medicineInputs];
    updatedMedicineInputs.splice(index, 1);
    setMedicineInputs(updatedMedicineInputs);
  };

  // Handle quantity and amount changes
  const handleQuantityChange = (index, e) => {
    const { value } = e.target;
    const updatedMedicineInputs = [...medicineInputs];
    const quantity = parseFloat(value); // Ensure quantity is a number
    updatedMedicineInputs[index].quantity = isNaN(quantity) ? 1 : quantity;
  
    // Ensure sellPrice is a number
    const sellPrice = parseFloat(updatedMedicineInputs[index].sellPrice);
    updatedMedicineInputs[index].amount =
      updatedMedicineInputs[index].quantity * (isNaN(sellPrice) ? 0 : sellPrice);
  
    setMedicineInputs(updatedMedicineInputs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = {
      ...form,
      medicines: medicineInputs.map(
        ({
          medicineName,
          medicineId,
          quantity,
          buyPrice,
          sellPrice,
          batchNumber,
          expiry,
          companyName,
          amount,
        }) => ({
          medicineId,
          name: medicineName,
          quantity,
          buyPrice,
          sellPrice,
          batchNumber,
          expiry,
          companyName,
          amount,
        })
      ),
    };

    // console.log("Form Submission:", submissionData); 
    onAddReturnMed(submissionData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "700px" }}>
        <button type="button" onClick={onClose} className="closeBtn">
          X
        </button>
        <h3>Add Medicine for return</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Patient Name:</label>
              <input
                className="form-input"
                type="text"
                name="patientName"
                value={form.patientName}
                onChange={handlePatientInput}
                placeholder="Search Patient by Name"
                autoComplete="off"
              />
              {filteredPatients.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {filteredPatients.map((patient) => (
                    <li
                      key={patient._id}
                      onClick={() => handlePatientSelect(patient)}
                      className="dropdown-item"
                    >
                      {patient.patientName} ({patient.uhid})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group">
              <label>Return Date:</label>
              <input
                type="date"
                name="returnDate"
                onChange={handleChange}
                value={form.returnDate}
              />
            </div>
          </div>
          {/* <h4>Medicines</h4> */}
          <div style={{ display: "flex", gap: "90px", width: "100%" }}>
            <div>
              <label>Medicine Name:</label>
            </div>
            <div>
              <label>Quantity:</label>
            </div>
            {/* <div>
              <label>Amount:</label>
            </div> */}
          </div>

          {medicineInputs.map((medicine, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type="text"
                  value={medicine.medicineName}
                  onChange={(e) => handleMedicineInput(index, e)}
                  placeholder="Search Medicine by Name"
                  autoComplete="off"
                />
                {medicine.filteredMedicines.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {medicine.filteredMedicines.map((med) => (
                      <li
                        key={med._id}
                        onClick={() => handleMedicineSelect(index, med)}
                        className="dropdown-item"
                      >
                        {med.name} - Batch: {med.batchNumber}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <input
                  type="number"
                  value={medicine.quantity}
                  onChange={(e) => handleQuantityChange(index, e)}
                />
              </div>

              {/* <div>
                <input type="number" value={medicine.amount} readOnly />
              </div> */}

              <div>
                <button
                  type="button"
                  onClick={() => removeMedicineInput(index)}
                  className="remove-return-btn"
                >
                  -
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addMedicineInput}
            style={{ width: "fit-content" }}
          >
            +
          </button>

          <button type="submit">Add Medicine</button>
        </form>
      </div>
    </div>
  );
};

export default AddReturnMed;

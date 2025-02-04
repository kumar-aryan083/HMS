import React, { useContext, useEffect, useRef, useState } from "react";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faPrint,
  faTrash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddReturnMed from "./AddReturnMed";
import { useReactToPrint } from "react-to-print";
import ReturnMedPrint from "./ReturnMedPrint";

const ReturnMed = () => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnMedicines, setReturnMedicines] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    returnDate: "",
    medicines: [],
  });
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
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
  const [editingMedicines, setEditingMedicines] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineSearchResults, setMedicineSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  // const [totalPages, setTotalPages] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [patientItem, setPatientItem] = useState({});

  const viewRef = useRef();
  const editRef = useRef();
  const documentRef = useRef();
  
    const printBill = useReactToPrint({
      contentRef: documentRef,
    });

  useEffect(() => {
    fetchReturnMed();
    fetchPatients();
    fetchMedicines();
  }, []);
  useEffect(() => {
    fetchReturnMed();
  }, []);

  const handlePrint = (med) => {
    // console.log("med", med);
    // fetchPatientDetails(med.patientId);
    // console.log("patient details  ", patientDetails);
    setPatientItem(med);
    setTimeout(() => {
      printBill();
    }, 300);
  };

  const fetchData = async () => {
    // console.log("fetchData");
    fetchReturnMed();
  };

  const fetchReturnMed = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/get-return-medicine?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setReturnMedicines(data.items);
        // setTotalPages(data.totalPages);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/patient/patients-list`,
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
      setPatients(data.patientDetails);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };
  const fetchMedicines = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/pharmacy/search-medicine`,
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
      setMedicineInputs(data.medicines);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleAddReturnMed = async (med) => {
    // console.log("added return medicine: ", med);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/return-medicine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(med),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setReturnMedicines((prevRes) => [...prevRes, data.newReturn]);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (returnMed) => {
    // console.log(returnMed);
    editRef.current.style.display = "flex";
    setId(returnMed._id);
    setForm({
      patientId: returnMed.patientId,
      patientName: returnMed.patientName,
      returnDate: returnMed.returnDate
        ? returnMed.returnDate.split("T")[0]
        : "",
    });
    setEditingMedicines(
      returnMed.medicines.map((med) => ({
        medicineId: med.medicineId,
        name: med.name,
        quantity: med.quantity,
        buyPrice: med.buyPrice,
        sellPrice: med.sellPrice,
        batchNumber: med.batchNumber,
        expiry: med.expiry,
        companyName: med.companyName,
        amount: med.amount,
      }))
    );
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      ...form,
      medicines: editingMedicines.map((med) => ({
        medicineId: med.medicineId,
        name: med.name,
        quantity: med.quantity,
        buyPrice: med.buyPrice,
        sellPrice: med.sellPrice,
        batchNumber: med.batchNumber,
        expiry: med.expiry,
        companyName: med.companyName,
        amount: med.quantity * med.sellPrice,
      })),
    };

    // console.log("Form Submission:", submissionData);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/update-return-medicine/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(submissionData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setReturnMedicines((preRes) =>
          preRes.map((existingRes) =>
            existingRes._id === data.returnEntry._id
              ? data.returnEntry
              : existingRes
          )
        );
        setNotification(data.message);
        handleClose();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteReturnMed = async (medId) => {
    // console.log(medId);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/delete-return-medicine/${medId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setReturnMedicines((prevRes) =>
          prevRes.filter((res) => res._id !== data.deleted._id)
        );
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
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

  const handleEditMedicineSearch = (e) => {
    const query = e.target.value;
    setMedicineSearch(query);
    if (query.length > 2) {
      const filtered = medicineInputs.filter((med) =>
        med.name?.toLowerCase().includes(query.toLowerCase())
      );
      setMedicineSearchResults(filtered);
    } else {
      setMedicineSearchResults([]);
    }
  };

  const handleEditMedicineSelect = (medicine) => {
    setEditingMedicines([
      ...editingMedicines,
      {
        medicineId: medicine._id,
        name: medicine.name,
        quantity: 1,
        buyPrice: medicine.buyPrice,
        sellPrice: medicine.pricePerUnit || medicine.sellPrice,
        batchNumber: medicine.batchNumber,
        expiry: medicine.expiryDate,
        companyName: medicine.companyName,
        amount: medicine.pricePerUnit || medicine.sellPrice,
      },
    ]);
    setMedicineSearch("");
    setMedicineSearchResults([]);
  };

  const handleEditQuantityChange = (index, value) => {
    const updated = [...editingMedicines];
    const quantity = parseInt(value) || 0;
    updated[index] = {
      ...updated[index],
      quantity: quantity,
      amount: quantity * updated[index].sellPrice,
    };
    setEditingMedicines(updated);
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
      updatedMedicineInputs[index].quantity *
      (isNaN(sellPrice) ? 0 : sellPrice);

    setMedicineInputs(updatedMedicineInputs);
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleViewMed = (med) => {
    setSelectedMed(med);
    viewRef.current.style.display = "flex";
  };

  const handleViewClose = () => {
    viewRef.current.style.display = "none";
    setSelectedMed(null);
  };

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);

    if (isNaN(date)) {
      throw new Error("Invalid date");
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditRemoveMedicine = (index) => {
    setEditingMedicines(editingMedicines.filter((_, i) => i !== index));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...returnMedicines]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(returnMedicines.length / itemsPerPage);

  return (
    <div className="consumable-list">
      <h2>Returned Medicines</h2>
      <div
        className="am-head"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="date-filters">
          {/* <label>
            Start Date: */}
          <input
            style={{ height: "fit-content" }}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {/* </label> */}
          {/* <label style={{ marginLeft: "20px" }}>
            End Date: */}
          <input
            style={{ height: "fit-content", marginLeft: "10px" }}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {/* </label> */}
          <button
            style={{ height: "fit-content", marginTop: "5px" }}
            className="statistics-search"
            onClick={() => fetchData()}
          >
            Show
          </button>
        </div>
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="add-consumable-btn"
          style={{ height: "fit-content", marginTop: "25px" }}
        >
          Add Medicine
        </button>
      </div>
      <hr className="am-h-line" />

      {/* Render the medications in a professional table */}
      {loading ? (
        <Loader />
      ) : (
        <table className="consumable-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Return Date</th>
              <th>Patient Name</th>
              <th>Total Medicines</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((med, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{formatDateToDDMMYYYY(med?.returnDate)}</td>
                  <td>{med?.patientName || "N/A"}</td>
                  <td>{med?.medicines.length}</td>
                  <td>
                    {med?.medicines?.reduce(
                      (sum, obj) => sum + (obj.amount || 0),
                      0
                    )}
                  </td>
                  <td
                    className="ipd-consumable-icons"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="icon"
                      onClick={() => handleEditing(med)}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="icon"
                      onClick={() => handleDeleteReturnMed(med._id)}
                    />
                    <FontAwesomeIcon
                      icon={faEye}
                      title="View"
                      className="icon"
                      onClick={() => handleViewMed(med)}
                    />
                    <FontAwesomeIcon
                      icon={faPrint}
                      title="Print"
                      className="icon"
                      onClick={() => handlePrint(med)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No Store Recievers assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span style={{ margin: "0 15px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <AddReturnMed
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddReturnMed={handleAddReturnMed}
        patients={patients}
        medicines={medicineInputs}
      />
      {patientItem && (
        <ReturnMedPrint
          selectedBill={patientItem}
          printRef={documentRef}
        />
      )}

      <div
        className="return-med-popup-container"
        ref={viewRef}
        style={{ display: "none" }}
      >
        <div className="return-med-popup">
          <div className="return-med-popup-header">
            <h3>Medicine Details</h3>
            <button className="return-med-close-btn" onClick={handleViewClose}>
              X
            </button>
          </div>
          <div className="return-med-popup-content" >
            {selectedMed && (
              <>
                <div className="return-med-patient-details">
                  <p>
                    <strong>Patient Name:</strong> {selectedMed.patientName}
                  </p>
                  <p>
                    <strong>Return Date:</strong>{" "}
                    {formatDateToDDMMYYYY(selectedMed.returnDate)}
                  </p>
                </div>
                <div className="return-med-medicines-table-container">
                  <table className="return-med-medicines-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Medicine Name</th>
                        <th>Batch Number</th>
                        <th>Quantity</th>
                        <th>Price/Unit</th>
                        <th>Total Amount</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMed.medicines.map((medicine, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{medicine.name}</td>
                          <td>{medicine.batchNumber}</td>
                          <td>{medicine.quantity}</td>
                          <td>{medicine.sellPrice}</td>
                          <td>{medicine.amount}</td>
                          <td>{formatDateToDDMMYYYY(medicine.expiry)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="5" style={{ textAlign: "right" }}>
                          <strong>Total Amount:</strong>
                        </td>
                        <td colSpan="2">
                          {selectedMed.medicines.reduce(
                            (sum, med) => sum + (med.amount || 0),
                            0
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="edit-wing" ref={editRef}>
        <div
          className="modal-content"
          style={{
            maxWidth: "850px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="closeBtn"
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#000",
              cursor: "pointer",
            }}
          >
            X
          </button>
          <h3 style={{ marginBottom: "20px", fontSize: "24px", color: "#333" }}>
            Edit Return Medicines
          </h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group" style={{ marginBottom: "20px" }}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "16px", color: "#333" }}>
                  Patient Name:
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="patientName"
                  value={form.patientName}
                  onChange={handlePatientInput}
                  placeholder="Search Patient by Name"
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                {filteredPatients.length > 0 && (
                  <ul
                    className="autocomplete-dropdown"
                    style={{
                      marginTop: "5px",
                      padding: "0",
                      listStyle: "none",
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      position: "absolute",
                      zIndex: "10", // Ensures dropdown stays above other content
                      width: "100%", // Make sure the dropdown is the same width as the input field
                      top: "100%", // Align the dropdown just below the input field
                    }}
                  >
                    {filteredPatients.map((patient) => (
                      <li
                        key={patient._id}
                        onClick={() => handlePatientSelect(patient)}
                        className="dropdown-item"
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#333",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {patient.patientName} ({patient.uhid})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "16px", color: "#333" }}>
                  Return Date:
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={form.returnDate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>

            <div className="medicines-section" style={{ marginBottom: "20px" }}>
              <h4
                style={{
                  fontSize: "20px",
                  marginBottom: "10px",
                  color: "#333",
                }}
              >
                Medicines
              </h4>
              <div
                className="medicine-search"
                style={{
                  marginBottom: "15px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  value={medicineSearch}
                  onChange={handleEditMedicineSearch}
                  placeholder="Search medicines..."
                  className="form-input"
                  style={{
                    padding: "10px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                {medicineSearchResults.length > 0 && (
                  <ul
                    className="autocomplete-dropdown"
                    style={{
                      marginTop: "5px",
                      padding: "0",
                      listStyle: "none",
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      position: "absolute",
                      zIndex: "10",
                      width: "100%",
                      top: "100%",
                    }}
                  >
                    {medicineSearchResults.map((medicine) => (
                      <li
                        key={medicine._id}
                        onClick={() => handleEditMedicineSelect(medicine)}
                        className="dropdown-item"
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#333",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {medicine.name} - Batch: {medicine.batchNumber}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {editingMedicines.length > 0 && (
                <table
                  className="medicine-table"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "20px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f4f4f4",
                        color: "#333",
                        fontSize: "16px",
                      }}
                    >
                      <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                        Medicine
                      </th>
                      <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                        Batch
                      </th>
                      <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                        Expiry
                      </th>
                      <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                        Price
                      </th>
                      <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                        Quantity
                      </th>
                      <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                        Amount
                      </th>
                      <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingMedicines.map((medicine, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid #ddd" }}
                      >
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {medicine.name}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {medicine.batchNumber}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {medicine.expiry}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {medicine.sellPrice}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="1"
                            value={medicine.quantity}
                            onChange={(e) =>
                              handleEditQuantityChange(index, e.target.value)
                            }
                            className="quantity-input"
                            style={{
                              width: "60px",
                              padding: "6px",
                              fontSize: "16px",
                              textAlign: "center",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {medicine.quantity * medicine.sellPrice}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleEditRemoveMedicine(index)}
                            className="remove-btn"
                            style={{
                              padding: "5px 10px",
                              backgroundColor: "#ff4d4d",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="form-actions" style={{ textAlign: "center" }}>
              <button
                type="submit"
                className="submit-btn"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Update Return Medicine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnMed;

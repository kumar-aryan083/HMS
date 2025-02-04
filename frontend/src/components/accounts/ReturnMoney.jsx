import React, { useContext, useEffect, useRef, useState } from "react";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddReturnMoney from "./AddReturnMoney";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReturnMoney = ({admissionId}) => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnMoney, setReturnMoney] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    amount: "",
    remarks: "",
    returnDate: "",
  });
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const editRef = useRef();

  useEffect(() => {
    fetchReturnMoney();
    fetchPatients();
    fetchPatientFromAdmissionId();
  }, []);
  useEffect(() => {
    fetchReturnMoney();
  }, []);

  const fetchData = async () => {
    // console.log("fetchData");
    fetchReturnMoney();
  };

  const fetchReturnMoney = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-return-money?startDate=${startDate}&endDate=${endDate}`,
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
        setReturnMoney(data.items);
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
  const fetchPatientFromAdmissionId = async () => {
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

  const handleAddReturnMoney = async (money) => {
    // console.log("added return money: ", money);
    const updatedMoney = {...money, patientId: patientData.patientId, patientName: patientData.name};
    // console.log("updated moeny", updatedMoney)
    try {
      const res = await fetch(`${environment.url}/api/account/return-money`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedMoney),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setReturnMoney((prevRes) => [...prevRes, data.returnMoney]);
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
      amount: returnMed.amount,
      remarks: returnMed.remarks,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // console.log("Form Submission:", form);
    const updatedForm = {...form, patientId: patientData.patientId, patientName: patientData.name}
    try {
      const res = await fetch(
        `${environment.url}/api/account/update-return-money/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedForm),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setReturnMoney((preRes) =>
          preRes.map((existingRes) =>
            existingRes._id === data.updatedReturnMoney._id
              ? data.updatedReturnMoney
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

  const handleDeleteReturnMoney = async (moneyId) => {
    // console.log(moneyId);
    try {
      const res = await fetch(
        `${environment.url}/api/account/delete-return-money/${moneyId}`,
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
        setReturnMoney((prevRes) =>
          prevRes.filter((res) => res._id !== data.deletedReturnMoney._id)
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

  const handleClose = () => {
    editRef.current.style.display = "none";
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...returnMoney]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(returnMoney.length / itemsPerPage);

  const exportToExcel = () => {
    if (returnMoney.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = returnMoney.map((money, index) => ({
      "#": index + 1,
      "Return Date": formatDateToDDMMYYYY(money.returnDate) || "N/A",
      "Patient Name": money.patientName || "N/A",
      Amount: money.amount || "N/A",
      Remarks: money.remarks || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Return Money");
    XLSX.writeFile(workbook, "Return_Money.xlsx");
  };

  const exportToCsv = () => {
    if (returnMoney.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = returnMoney.map((money, index) => ({
      "#": index + 1,
      "Return Date": formatDateToDDMMYYYY(money.returnDate) || "N/A",
      "Patient Name": money.patientName || "N/A",
      Amount: money.amount || "N/A",
      Remarks: money.remarks || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Return Money");
    XLSX.writeFile(workbook, "Return_Money.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (returnMoney.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Return Money Report", 14, 10);

    const tableData = returnMoney.map((money, index) => [
      index + 1,
      formatDateToDDMMYYYY(money.returnDate) || "N/A",
      money.patientName || "N/A",
      money.amount || "N/A",
      money.remarks || "N/A",
    ]);

    pdf.autoTable({
      head: [["#", "Return Date", "Patient Name", "Amount", "Remarks"]],
      body: tableData,
    });

    pdf.save("Return_Money.pdf");
  };

  return (
    <div className="consumable-list" style={{marginTop: "0", paddingTop: "0"}}>
      <h2>Returned Money</h2>
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
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={exportToExcel}
            className="export-btn"
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
              // marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFileExcel} /> Excel
          </button>
          <button
            onClick={exportToCsv}
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
              // marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFileCsv} /> CSV
          </button>
          <button
            onClick={exportToPdf}
            style={{
              width: "fit-content",
              height: "fit-content",
              margin: "auto 0",
              // marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} /> PDF
          </button>
        </div>
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="add-consumable-btn"
          style={{ height: "fit-content", marginTop: "25px" }}
        >
          Add Money
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
              <th>Amount</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((money, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{formatDateToDDMMYYYY(money?.returnDate)}</td>
                  <td>{money?.patientName || "N/A"}</td>
                  <td>{money?.amount}</td>
                  <td>{money?.remarks}</td>
                  <td
                    className="ipd-consumable-icons"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="icon"
                      onClick={() => handleEditing(money)}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="icon"
                      onClick={() => handleDeleteReturnMoney(money._id)}
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

      <AddReturnMoney
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddReturnMoney={handleAddReturnMoney}
        patients={patients}
        patientData={patientData}
      />

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
            Edit Return Money
          </h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Patient Name:</label>
                <input
                  className="form-input"
                  type="text"
                  name="patientName"
                  value={patientData?.name}
                  // onChange={handlePatientInput}
                  // placeholder="Search Patient by Name"
                  autoComplete="off"
                  readOnly
                />
                {/* {filteredPatients.length > 0 && (
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
                )} */}
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  name="amount"
                  onChange={handleChange}
                  value={form.amount}
                />
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Return Date:</label>
                <input
                  type="date"
                  name="returnDate"
                  onChange={handleChange}
                  value={form.returnDate}
                />
              </div>
              <div className="form-group">
                <label>Remarks:</label>
                <input
                  type="text"
                  name="remarks"
                  onChange={handleChange}
                  value={form.remarks}
                />
              </div>
            </div>

            <div className="form-actions" style={{ textAlign: "center" }}>
              <button
                type="submit"
                className="submit-btn"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--secondBase)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Update Return Money
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnMoney;

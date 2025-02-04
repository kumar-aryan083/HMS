import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";
import { environment } from "../../utlis/environment";
import Loader from "./Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../utlis/userDetails";
import AddAdditonalService from "./AddAdditionalService";
import AddStaffExpense from "./AddStaffExpense";

const StaffExpenses = () => {
  const { setNotification, user } = useContext(AppContext);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    type: "TA", // Default value as per the `enum`
    amount: "",
    note: "",
    date: "",
    staffId: "", // Added staffId to the form state
    staffRole: "", // Added staffRole to the form state
    expenseNumber: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]); // Store all staff names
  const [filteredStaff, setFilteredStaff] = useState([]); // Store filtered suggestions
  const [staff, setStaff] = useState(null);
  const nav = useNavigate();
  const editRef = useRef();

  useEffect(() => {
    document.title = "Additional Services | HMS";
    if (editRef.current) {
      editRef.current.style.display = "none";
    }
    // fetchStaffExpenses();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/admin/get-agent-staff`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      ); // Assume there's an API to fetch staff
      const data = await response.json();
      setStaffList(data.allItems); // Save the staff list to state
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchStaffExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${environment.url}/api/common/get-staff-expenses?staffId=${staff._id}&staffRole=${staff.role}`,
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
      // console.log("expenses", data);
      setExpenses(data.expenses);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStaffExpensesRefresh = async (staffId, staffRole) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${environment.url}/api/common/get-staff-expenses?staffId=${staffId}&staffRole=${staffRole}`,
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
      // console.log("expenses", data);
      setExpenses(data.expenses);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseNumber) => {
    // console.log(expenseNumber);
    const bodyData = {
      staffId: staff._id,
      staffRole: staff.role,
      expenseNumber: expenseNumber,
    };
    try {
      const res = await fetch(
        `${environment.url}/api/common/delete-staff-expense/`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(bodyData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setExpenses((prev) =>
          prev.filter((expense) => expense.expenseNumber !== expenseNumber)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleEditing = (expense) => {
    // console.log(expense);
    // console.log(staff);
    editRef.current.style.display = "flex";
    setId(expense._id);
    setForm({
      type: expense.type, // Default value as per the `enum`
      amount: expense.amount,
      note: expense.note,
      date: new Date(expense.date).toISOString().slice(0, 10),
      staffId: staff._id, // Added staffId to the form state
      staffRole: staff.role,
      expenseNumber: expense.expenseNumber,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("edited staff expense", form);
    const userDetails = getUserDetails();
    const updatedForm = { ...form, ...userDetails };
    // console.log("updatedForm", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/common/edit-staff-expense`,
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
        setNotification(data.message);
        setExpenses((prev) =>
          prev.map((expense) =>
            expense._id === data.data._id ? data.data : expense
          )
        );
        handleClose();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddExpense = async (expense) => {
    //  console.log("added services:", expense);
    // console.log("Staff Expense:", expense);
    const userDetails = getUserDetails();
    const updatedForm = { ...expense, ...userDetails };
    // console.log("updatedForm", updatedForm);
    try {
      const res = await fetch(`${environment.url}/api/common/staff-expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        if (staff._id === expense.staffId) {
          fetchStaffExpensesRefresh(expense.staffId, expense.staffRole);
        }
        // setExpenses((prev) => [...prev, data.data]);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStaffChange = (e) => {
    const input = e.target.value;
    setStaff(input);

    // Filter staff when user types more than 2 characters
    if (input.length > 2) {
      const filtered = staffList.filter((staffMember) =>
        staffMember.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff([]); // Clear suggestions when input length is less than 3
    }
  };

  // Handle staff selection from the suggestions
  const handleStaffSelect = (selectedStaff) => {
    setStaff(selectedStaff); // Set selected staff name in input
    setForm({
      ...form,
      staffId: selectedStaff._id, // Add staffId to the form state
      staffRole: selectedStaff.role, // Add staffRole to the form state
    });
    setFilteredStaff([]); // Clear suggestions after selection
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...expenses].slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

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

  // Export to Excel
  const exportToExcel = () => {
    const visibleData = currentItems.map((expense) => ({
      Date: formatDateToDDMMYYYY(expense.date),
      "Expense No.": expense.expenseNumber,
      Type: expense.type,
      Amount: expense.amount,
      Note: expense.note,
    }));

    // Create worksheet and export
    const worksheet = XLSX.utils.json_to_sheet(visibleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StaffExpenses");
    XLSX.writeFile(workbook, "StaffExpenses.xlsx");
  };

  // Export to CSV
  const exportToCSV = () => {
    const visibleData = currentItems.map((expense) => ({
      Date: formatDateToDDMMYYYY(expense.date),
      "Expense No.": expense.expenseNumber,
      Type: expense.type,
      Amount: expense.amount,
      Note: expense.note,
    }));

    // Convert to CSV and trigger download
    const worksheet = XLSX.utils.json_to_sheet(visibleData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "StaffExpenses.csv");
    link.click();
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Map visible table data fields
    const tableData = currentItems.map((expense, index) => [
      index + 1, // Add row numbers
      formatDateToDDMMYYYY(expense.date),
      expense.expenseNumber,
      expense.type,
      expense.amount,
      expense.note,
    ]);

    // Generate PDF table
    doc.text("Staff Expenses", 10, 10);
    doc.autoTable({
      head: [["#", "Date", "Expense No.", "Type", "Amount", "Note"]], // Visible headers
      body: tableData,
    });

    // Save PDF
    doc.save("StaffExpenses.pdf");
  };

  return (
    <>
      <div className="full-doctor-list" style={{ margin: "0 70px" }}>
        <h2 style={{ margin: "0" }}>All Staff Expenses</h2>
        <div className="upper-wing" style={{ padding: "0" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <div
              className="form-group"
              style={{
                width: "fit-content",
                height: "fit-content",
                marginTop: "42px",
              }}
            >
              <input
                type="text"
                placeholder="Search staff by name..."
                value={staff?.name}
                onChange={handleStaffChange}
              />
              {filteredStaff.length > 0 && (
                <div className="attendence-suggestions">
                  {filteredStaff.map((staffMember) => (
                    <div
                      key={staffMember._id} // Assuming each staff has a unique ID
                      className="attendence-suggestion-item"
                      onClick={() => handleStaffSelect(staffMember)}
                    >
                      {staffMember.name} ({staffMember.phone || "N/A"})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => fetchStaffExpenses()}
              style={{
                width: "fit-content",
                height: "fit-content",
                marginTop: "45px",
              }}
            >
              Search
            </button>
          </div>
          <div
            className="export-buttons"
            style={{
              display: "flex",
              gap: "10px",
              width: "fit-content",
              height: "fit-content",
              marginTop: "45px",
            }}
          >
            <button onClick={exportToExcel} className="export-btn">
              <FontAwesomeIcon icon={faFileExcel} /> Excel
            </button>
            <button onClick={exportToCSV} className="export-btn">
              <FontAwesomeIcon icon={faFileCsv} /> CSV
            </button>
            <button onClick={exportToPDF} className="export-btn">
              <FontAwesomeIcon icon={faFilePdf} /> PDF
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-consumable-btn"
          >
            Add Expense
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="lower-wing">
            <table className="wing-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Expense No.</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.length > 0 ? (
                  currentItems.map((expense, index) => (
                    <tr key={expense._id}>
                      <td>{index + 1}</td>
                      <td>{formatDateToDDMMYYYY(expense.date)}</td>
                      <td>{expense.expenseNumber}</td>
                      <td>{expense.type}</td>
                      <td>{expense.amount}</td>
                      <td>{expense.note}</td>
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(expense)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() =>
                            handleDeleteExpense(expense.expenseNumber)
                          }
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      Select Staff to get their expenses
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </button>
          <span style={{ margin: "0 15px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div
        className="department-modal-container edit-department-modal"
        ref={editRef}
      >
        <div className="department-modal-content">
          <button
            type="button"
            onClick={handleClose}
            className="department-modal-close-btn"
          >
            X
          </button>
          <h3 className="department-modal-title">Edit Staff Expense</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Date:</label>
                <input
                  className="form-input"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  className="form-input"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="TA">TA</option>
                  <option value="DA">DA</option>
                  <option value="HRA">HRA</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Staff</label>
                <input
                  type="text"
                  placeholder="Search staff by name..."
                  value={staff?.name}
                  onChange={handleStaffChange}
                  disabled
                />
                {filteredStaff.length > 0 && (
                  <div className="attendence-suggestions">
                    {filteredStaff.map((staffMember) => (
                      <div
                        key={staffMember.id} // Assuming each staff has a unique ID
                        className="attendence-suggestion-item"
                        onClick={() => handleStaffSelect(staffMember)}
                      >
                        {staffMember.name} ({staffMember.phone || "N/A"})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Amount Input */}
              <div className="form-group">
                <label>Amount:</label>
                <input
                  className="form-input"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            {/* Note Input */}
            <div className="form-group">
              <label>Note:</label>
              <textarea
                className="form-input"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Add any additional notes"
                rows="2"
              ></textarea>
            </div>

            <button type="submit" className="department-modal-submit-btn">
              Update Expense
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="staff-modal-overlay">
          <div>
            <button
              className="staff-modal-close-btn"
              onClick={handleModalClose}
            >
              X
            </button>
            <AddStaffExpense
              onClose={handleModalClose}
              onAddExpense={handleAddExpense}
              staffList={staffList}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StaffExpenses;

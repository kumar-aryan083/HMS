import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddExpense from "./AddExpense";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import {
  exportExpensesToCSV,
  exportExpensesToExcel,
  exportExpensesToPDF,
} from "../../../utlis/exportExpenseReport";
import { useNavigate } from "react-router-dom";

const AccountsExpenses = () => {
  const { setNotification, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    head: "",
    amount: "",
    paymentMode: "",
    date: "",
    time: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [supplierBills, setSupplierBills] = useState([]);
  const [storeVendorBills, setStoreVendorBills] = useState([]);
  const [hrExpenses, setHrExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [totalExpense, setTotalExpense] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const nav = useNavigate();

  const editRef = useRef();

  useEffect(() => {
    document.title = "Expenses | HMS";
    if (!user) {
      // setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-expenses?startDate=${startDate}&endDate=${endDate}`,
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
        setExpenses(data.items);
        setSupplierBills(data.supplierBills);
        setStoreVendorBills(data.storeVendorBills);
        setHrExpenses(data.hrExpenses);
        setTotalExpense(data.totalExpense);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense) => {
    const updatedExpense = { ...expense, user: user.name, userRole: user.role, userEmail: user.email };
    // console.log("added expense: ", updatedExpense);
    try {
      const res = await fetch(`${environment.url}/api/account/add-expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedExpense),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setExpenses((prev) => [...prev, data.expense]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (expense) => {
    // console.log(expense);
    editRef.current.style.display = "flex";
    setId(expense.expenseNo);
    setForm({
      head: expense.head,
      amount: expense.amount,
      paymentMode: expense.paymentMode,
      date: expense.date,
      time: expense.time,
      details: expense.details,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedForm = { ...form, user: user.name };
    // console.log("Edited expense", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/account/edit-expense/${id}`,
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
        setExpenses((prev) =>
          prev.map((existing) =>
            existing._id === data.updatedExpense._id
              ? data.updatedExpense
              : existing
          )
        );
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    // console.log(expenseId);
    try {
      const res = await fetch(
        `${environment.url}/api/account/delete-expense/${expenseId}`,
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
        setExpenses((prev) =>
          prev.filter((expense) => expense._id !== data.deletedExpense._id)
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
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const totalPages = Math.ceil(
    activeTab === "expenses"
      ? expenses.length / itemsPerPage
      : activeTab === "supplierBills"
      ? supplierBills.length / itemsPerPage
      : activeTab=== "storeVendorBills"
      ? storeVendorBills.length / itemsPerPage
      : hrExpenses.length / itemsPerPage
  );
  const getPaginatedData = () => {
    const activeData =
      activeTab === "expenses"
        ? expenses
        : activeTab === "supplierBills"
        ? supplierBills
        : activeTab === "storeVendorBills"
        ? storeVendorBills
        : hrExpenses

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return activeData.slice(startIndex, endIndex);
  };
  return (
    <div className="pharmacy-list" style={{ marginTop: "0" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Expenses</h2>
        <div
          className="export-buttons"
          style={{ display: "flex", gap: "10px" }}
        >
          <button
            className="export-btn"
            onClick={() =>
              exportExpensesToExcel(
                activeTab === "expenses"
                  ? expenses
                  : activeTab === "supplierBills"
                  ? supplierBills
                  : activeTab === "storeVendorBills"
                  ? storeVendorBills
                  : hrExpenses,
                activeTab
              )
            }
          >
            Excel
          </button>
          <button
            className="export-btn"
            onClick={() =>
              exportExpensesToCSV(
                activeTab === "expenses"
                ? expenses
                : activeTab === "supplierBills"
                ? supplierBills
                : activeTab === "storeVendorBills"
                ? storeVendorBills
                : hrExpenses,
                activeTab
              )
            }
          >
            CSV
          </button>
          <button
            className="export-btn"
            onClick={() =>
              exportExpensesToPDF(
                activeTab === "expenses"
                ? expenses
                : activeTab === "supplierBills"
                ? supplierBills
                : activeTab === "storeVendorBills"
                ? storeVendorBills
                : hrExpenses,
                activeTab
              )
            }
          >
            PDF
          </button>
        </div>
      </div>
      {/* <div className="am-head">
        <button
          onClick={() => setIsModalOpen(true)}
          className="add-consumable-btn"
        >
          Add Expense
        </button>
      </div> */}
      <hr className="am-h-line" />

      <div style={{ fontWeight: "500" }}>Total Expense: {totalExpense}</div>

      <div className="accounts-tabs" style={{ marginTop: "0" }}>
        <button
          className={`tab ${activeTab === "expenses" ? "active" : ""}`}
          onClick={() => setActiveTab("expenses")}
        >
          Other Expenses
        </button>
        {(user?.role === "admin" || user?.role === "pharmacy") && <button
          className={`tab ${activeTab === "supplierBills" ? "active" : ""}`}
          onClick={() => setActiveTab("supplierBills")}
        >
          Pharmacy Supplier Bills
        </button>}
        <button
          className={`tab ${activeTab === "storeVendorBills" ? "active" : ""}`}
          onClick={() => setActiveTab("storeVendorBills")}
        >
          Store Vendor Bills
        </button>
        {(user?.role === "admin" || user?.role === "hr") && <button
          className={`tab ${activeTab === "hrExpenses" ? "active" : ""}`}
          onClick={() => setActiveTab("hrExpenses")}
        >
          HR Expenses
        </button>}
      </div>

      <div className="content">
        {activeTab === "expenses" && (
          <>
            <div className="am-head">
              <button
                onClick={() => setIsModalOpen(true)}
                className="pharmacy-add-btn"
              >
                Add Expense
              </button>
            </div>
            <hr className="am-h-line" />
            {loading ? (
              <Loader />
            ) : (
              <table className="pharmacy-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Expense No.</th>
                    <th>Expense Head</th>
                    <th>Details</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Date of Expense</th>
                    <th>User</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(expenses) &&
                  getPaginatedData(expenses).length > 0 ? (
                    getPaginatedData(expenses).map((expense, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{expense.expenseNo}</td>
                        <td>{expense.head}</td>
                        <td>{expense.details}</td>
                        <td>{expense.amount}</td>
                        <td>{expense.paymentMode}</td>
                        <td>{formatDateToDDMMYYYY(expense.date)}</td>
                        <td>{user?.name}</td>
                        <td
                          className="ipd-consumable-icons"
                          style={{ display: "flex", gap: "10px" }}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            title="Edit"
                            className="icon"
                            onClick={() => handleEditing(expense)}
                          />
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            title="Delete"
                            className="icon"
                            onClick={() =>
                              handleDeleteExpense(expense.expenseNo)
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data">
                        No Expenses to show yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === "supplierBills" && (
          <table className="consumable-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Bill Number</th>
                <th>Supplier Name</th>
                <th>Supplier Bill Number</th>
                <th>Total Medicines</th>
                <th>Total Amount</th>
                <th>Bill Date</th>
                {/* <th>Status</th> */}
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(supplierBills) &&
              getPaginatedData(supplierBills).length > 0 ? (
                getPaginatedData(supplierBills).map((bill, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{bill.billNumber}</td>
                    <td>{bill.supplierName}</td>
                    <td>{bill.supplierBillNumber}</td>
                    <td>{bill.medicines.length}</td>
                    <td>{bill.totalAmount}</td>
                    <td>{formatDateToDDMMYYYY(bill.billDate)}</td>
                    {/* <td>{bill.status}</td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No Supplier Bills to show yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === "storeVendorBills" && (
          <table className="consumable-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vendor Name</th>
                <th>Purchase Order Number</th>
                <th>Total Items</th>
                <th>Total Amount</th>
                {/* <th>Payment Type</th> */}
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(storeVendorBills) &&
              getPaginatedData(storeVendorBills).length > 0 ? (
                getPaginatedData(storeVendorBills).map((bill, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{bill.vendorName}</td>
                    <td>{bill.purchaseOrderNumber}</td>
                    <td>{bill.items.length}</td>
                    <td>
                      {bill.items.reduce(
                        (acc, item) => acc + parseFloat(item.finalPrice),
                        0
                      )}
                    </td>
                    {/* <td>{bill.paymentInfo.paymentType}</td> */}
                    <td>{formatDateToDDMMYYYY(bill.paymentInfo.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No Store Vendor Bills to show yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === "hrExpenses" && (
          <table className="consumable-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Expense Number</th>
                <th>Name</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData(hrExpenses) &&
              getPaginatedData(hrExpenses).length > 0 ? (
                getPaginatedData(hrExpenses).map((bill, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDateToDDMMYYYY(bill.date)}</td>
                    <td>{bill.expenseNumber}</td>
                    <td>{bill.name}</td>
                    <td>{bill.type}</td>
                    <td>{bill.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No HR expenses to show yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="pagination-controls">
        <button disabled={currentPage === 1} onClick={handlePreviousPage}>
          Previous
        </button>
        <div style={{ textAlign: "center", margin: "10px 0" }}>
          Page {currentPage} of {totalPages}
        </div>
        <button disabled={currentPage >= totalPages} onClick={handleNextPage}>
          Next
        </button>
      </div>

      <AddExpense
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Update Expense</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Head:</label>
                <input
                  type="text"
                  name="head"
                  onChange={handleChange}
                  value={form.head}
                />
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="text"
                  name="amount"
                  onChange={handleChange}
                  value={form.amount}
                />
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Payment Mode:</label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  onChange={handleChange}
                  value={
                    form.date
                      ? new Date(form.date).toISOString().split("T")[0]
                      : ""
                  }
                />
              </div>
              <div className="form-group">
                <label>Time:</label>
                <input
                  type="time"
                  name="time"
                  onChange={handleChange}
                  value={form.time}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Details</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                style={{ outline: "none" }}
              />
            </div>

            <button type="submit">Update Expense</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountsExpenses;

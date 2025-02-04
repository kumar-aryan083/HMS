import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import AddMiscIncome from "./AddMiscIncome";

const AccountsMiscIncome = () => {
  const { setNotification, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    head: "",
    date: "",
    time: "",
    amount: "",
    mode: "",
    details: "",
    user: "",
  });
  const [loading, setLoading] = useState(false);

  const editRef = useRef();

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-misc-income`,
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
        setIncomes(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMiscIncome = async (income) => {
    const updatedIncome = { ...income, user: user.name };
    // console.log("added misc.  income: ", updatedIncome);
    try {
      const res = await fetch(
        `${environment.url}/api/account/add-misc-income`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedIncome),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setIncomes((prev) => [...prev, data.miscIncome]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (income) => {
    // console.log(income);
    editRef.current.style.display = "flex";
    setId(income._id);
    setForm({
      head: income.head,
      date: income.date,
      time: income.time,
      amount: income.amount,
      mode: income.mode,
      details: income.details,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedForm = { ...form, user: user.name };
    // console.log("Edited incentive", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/account/edit-misc-income/${id}`,
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
        setIncomes((prev)=> prev.map((existing)=> existing._id === data.updatedMiscIncome._id ? data.updatedMiscIncome : existing))
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    // console.log(incomeId);
    try {
      const res = await fetch(
        `${environment.url}/api/account/delete-misc-income/${incomeId}`,
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
        setIncomes((prev)=> prev.filter((incentive)=> incentive._id !== data.deletedMiscIncome._id));
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

  return (
    <div className="consumable-list">
      <h2>Miscellaneous Income</h2>
      <div className="am-head">
        <button
          onClick={() => setIsModalOpen(true)}
          className="add-consumable-btn"
        >
          Add Miscellaneous Income
        </button>
      </div>
      <hr className="am-h-line" />

      {loading ? (
        <Loader />
      ) : (
        <table className="consumable-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Head</th>
              <th>Details</th>
              <th>Date of Income</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes && incomes.length > 0 ? (
              incomes.map((income, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{income.head}</td>
                  <td>{income.details}</td>
                  <td>{formatDateToDDMMYYYY(income.date)}</td>
                  <td>{income.amount}</td>
                  <td>{income.mode}</td>
                  <td>{user.name}</td>
                  <td
                    className="ipd-consumable-icons"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="icon"
                      onClick={() => handleEditing(income)}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="icon"
                      onClick={() => handleDeleteIncome(income._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No Misc. incomes to show yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <AddMiscIncome
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddIncome={handleAddMiscIncome}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="closeBtn">
            X
          </button>
          <h3>Update Misc. Income</h3>
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
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="text"
                  name="amount"
                  onChange={handleChange}
                  value={form.amount}
                />
              </div>
              <div className="form-group">
                <label>Payment Mode:</label>
                <select name="mode" value={form.mode} onChange={handleChange}>
                  <option value="">Select Payment Mode</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                </select>
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
            <button type="submit">Update Misc. Income</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountsMiscIncome;

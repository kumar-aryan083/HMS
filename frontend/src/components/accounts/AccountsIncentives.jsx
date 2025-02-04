import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import AddIncentive from "./AddIncentive";

const AccountsIncentives = () => {
  const { setNotification, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incentives, setIncentives] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    type: "Doctor",
    doctorName: "",
    doctorId: "",
    head: "",
    date: "",
    time: "",
    amount: "",
    mode: "",
    details: "",
    user: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const editRef = useRef();

  useEffect(() => {
    fetchIncentives();
    fetchDoctors();
  }, []);

  const fetchIncentives = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/account/get-incentives`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setIncentives(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/employee/get-doctors`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncentive = async (incentive) => {
    const updatedIncentive = { ...incentive, user: user.name };
    // console.log("added incentive: ", updatedIncentive);
    try {
      const res = await fetch(`${environment.url}/api/account/add-incentive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedIncentive),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setIncentives((prev) => [...prev, data.incentive]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (incentive) => {
    // console.log(incentive);
    editRef.current.style.display = "flex";
    setId(incentive._id);
    setForm({
      type: incentive.type,
      doctorName: incentive.doctorName,
      head: incentive.head,
      date: incentive.date,
      time: incentive.time,
      amount: incentive.amount,
      mode: incentive.mode,
      details: incentive.details,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedForm = { ...form, user: user.name };
    // console.log("Edited incentive", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/account/edit-incentive/${id}`,
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
        setIncentives((prev) =>
          prev.map((existing) =>
            existing._id === data.updatedIncentive._id
              ? data.updatedIncentive
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

  const handleDeleteIncentive = async (incentiveId) => {
    // console.log(incentiveId);
    try {
      const res = await fetch(
        `${environment.url}/api/account/delete-incentive/${incentiveId}`,
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
        setIncentives((prev) =>
          prev.filter(
            (incentive) => incentive._id !== data.deletedIncentive._id
          )
        );
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      doctorName: value,
    }));
    if (value.length > 2) {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setForm((prevData) => ({
      ...prevData,
      doctorId: doctor._id,
      doctorName: doctor.name,
    }));
    setFilteredDoctors([]);
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
      <h2>Incentives</h2>
      <div className="am-head">
        <button
          onClick={() => setIsModalOpen(true)}
          className="add-consumable-btn"
        >
          Add Incentive
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
              <th>Type</th>
              <th>Doctor Name</th>
              <th>Head</th>
              <th>Details</th>
              <th>Date of Incentive</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incentives && incentives.length > 0 ? (
              incentives.map((incentive, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{incentive.type}</td>
                  <td>{incentive.doctorName}</td>
                  <td>{incentive.head}</td>
                  <td>{incentive.details}</td>
                  <td>{formatDateToDDMMYYYY(incentive.date)}</td>
                  <td>{incentive.amount}</td>
                  <td>{incentive.mode}</td>
                  <td>{user.name}</td>
                  <td
                    className="ipd-consumable-icons"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="icon"
                      onClick={() => handleEditing(incentive)}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="icon"
                      onClick={() => handleDeleteIncentive(incentive._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  No Incentives to show yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <AddIncentive
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddIncentive={handleAddIncentive}
        doctors={doctors}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="closeBtn">
            X
          </button>
          <h3>Update Incentive</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Type:</label>
                <select
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              <div className="form-group">
                <label>Doctor Name:</label>
                <input
                  className="form-input"
                  type="text"
                  name="doctorName"
                  value={form.doctorName}
                  onChange={handleDoctorInput}
                  placeholder="Search Doctor by Name"
                  autoComplete="off"
                />
                {filteredDoctors.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {filteredDoctors.map((doctor) => (
                      <li
                        key={doctor._id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className="dropdown-item"
                      >
                        {doctor.name} ({doctor.phone})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
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

            <button type="submit">Update Incentive</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountsIncentives;

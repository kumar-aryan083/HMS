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
import AddDepartment from "./AddDepartment";
import { getUserDetails } from "../../utlis/userDetails";
import AddAdditonalService from "./AddAdditionalService";
import AddAgents from "./AddAgent";

const Agents = () => {
  const { setNotification, user } = useContext(AppContext);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    adhaarNumber: "",
    panNumber: "",
    dateOfBirth: "",
    accNumber: "",
    ifscCode: "",
    accHolderName: "",
    salary: "",
  });
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nav = useNavigate();
  const editRef = useRef();

  useEffect(() => {
    document.title = "Agenta List | HMS";
    if (!user || user.role !== "admin") {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    document.title = "Agents | HMS";
    if (editRef.current) {
      editRef.current.style.display = "none";
    }
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${environment.url}/api/admin/get-agents`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await response.json();
      // console.log("agents", data);
      setAgents(data.agents);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    // console.log(agentId);
    try {
      const res = await fetch(
        `${environment.url}/api/admin/delete-agent/${agentId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setAgents((prev) =>
          prev.filter((agent) => agent._id !== data.data._id)
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

  const handleEditing = (agent) => {
    // console.log(agent);
    editRef.current.style.display = "flex";
    setId(agent._id);
    setForm({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      adhaarNumber: agent.adhaarNumber,
      panNumber: agent.panNumber,
      dateOfBirth: agent.dateOfBirth
        ? new Date(agent.dateOfBirth).toISOString().split("T")[0]
        : "",
      accNumber: agent.accNumber,
      ifscCode: agent.ifscCode,
      accHolderName: agent.accHolderName,
      salary: agent.salary,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("updated agent:", form);
    try {
      const res = await fetch(
        `${environment.url}/api/admin/update-agent/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setAgents((prev) =>
          prev.map((agent) =>
            agent._id === data.data._id ? data.data : agent
          )
        );
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddAgent = async (agent) => {
    // console.log("added agent:", agent);
    try {
      const res = await fetch(`${environment.url}/api/admin/add-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(agent),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setAgents((prev) => [...prev, data.data]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...agents].slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(agents.length / itemsPerPage);

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

  return (
    <>
      <div className="full-doctor-list" style={{ margin: "20px 70px" }}>
        <div className="upper-wing">
          <h2>All Agents</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-consumable-btn"
          >
            Add Agent
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Aadhar</th>
                  <th>PAN</th>
                  <th>DOB</th>
                  <th>Account No.</th>
                  <th>Account Holder</th>
                  <th>IFSC</th>
                  <th>Salary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.length > 0 ? (
                  currentItems.map((agent, index) => (
                    <tr key={agent._id}>
                      <td>{index + 1}</td>
                      <td>{agent.name}</td>
                      <td>{agent.email || "N/A"}</td>
                      <td>{agent.phone || "N/A"}</td>
                      <td>{agent.aadharNumber || "N/A"}</td>
                      <td>{agent.panNumber || "N/A"}</td>
                      {/* <td>
                        {agent.dateOfBirth
                          ? new Date(agent.dateOfBirth).toLocaleDateString()
                          : "N/A"}
                      </td> */}
                      <td>{formatDateToDDMMYYYY(agent.dateOfBirth)}</td>
                      <td>{agent.accNumber || "N/A"}</td>
                      <td>{agent.accHolderName || "N/A"}</td>
                      <td>{agent.ifscCode || "N/A"}</td>
                      <td>{agent.salary || "N/A"}</td>
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(agent)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteAgent(agent._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" style={{ textAlign: "center" }}>
                      No Agents Available to Show
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
        <div className="department-modal-content" style={{ maxHeight: "80%", maxWidth: "60%" }}>
          <button
            type="button"
            onClick={handleClose}
            className="department-modal-close-btn"
          >
            X
          </button>
          <h3 className="department-modal-title">Edit Agent</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              {/* Name Field */}
              <div className="form-group">
                <label>Name:</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Agent Name"
                  required
                />
              </div>
              {/* Email Field */}
              <div className="form-group">
                <label>Email:</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                />
              </div>
              {/* Phone Field */}
              <div className="form-group">
                <label>Phone:</label>
                <input
                  className="form-input"
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
              </div>
            </div>
            <div className="form-row fg-group">
              {/* Aadhaar Number Field */}
              <div className="form-group">
                <label>Aadhaar Number:</label>
                <input
                  className="form-input"
                  type="text"
                  name="adhaarNumber"
                  value={form.adhaarNumber}
                  onChange={handleChange}
                  placeholder="Aadhaar Number"
                />
              </div>
              {/* PAN Number Field */}
              <div className="form-group">
                <label>PAN Number:</label>
                <input
                  className="form-input"
                  type="text"
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                  placeholder="PAN Number"
                />
              </div>
              {/* Date of Birth Field */}
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  className="form-input"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row fg-group">
              {/* Account Number Field */}
              <div className="form-group">
                <label>Account Number:</label>
                <input
                  className="form-input"
                  type="text"
                  name="accNumber"
                  value={form.accNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                />
              </div>
              {/* IFSC Code Field */}
              <div className="form-group">
                <label>IFSC Code:</label>
                <input
                  className="form-input"
                  type="text"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                  placeholder="IFSC Code"
                />
              </div>
              {/* Account Holder Name Field */}
              <div className="form-group">
                <label>Account Holder Name:</label>
                <input
                  className="form-input"
                  type="text"
                  name="accHolderName"
                  value={form.accHolderName}
                  onChange={handleChange}
                  placeholder="Account Holder Name"
                />
              </div>
              {/* Salary Field */}
              <div className="form-group">
                <label>Salary:</label>
                <input
                  className="form-input"
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="Salary"
                />
              </div>
            </div>

            <button type="submit" className="department-modal-submit-btn">
              Update Agent
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
            <AddAgents onClose={handleModalClose} onAddAgent={handleAddAgent} />
          </div>
        </div>
      )}
    </>
  );
};

export default Agents;

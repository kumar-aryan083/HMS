import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/StoreItemList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddStoreReciever from "./AddStoreReciever";

const StoreRecievers = () => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recievers, setRecievers] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    code: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const editRef = useRef();

  useEffect(() => {
    fetchStoreRecievers();
    fetchDepartments();
  }, []);

  const fetchStoreRecievers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/store/get-receivers`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setRecievers(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/admin/get-departments`,
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
      setDepartments(data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleAddStoreReciever = async (storeReciever) => {
    // console.log("added store reciever: ", storeReciever);
    try {
      const res = await fetch(`${environment.url}/api/store/add-receiver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(storeReciever),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setRecievers((prevRes) => [...prevRes, data.receiver]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (storeReciever) => {
    // console.log(storeReciever);
    editRef.current.style.display = "flex";
    setId(storeReciever._id);
    setForm({
      name: storeReciever.name,
      phone: storeReciever.phone,
      code: storeReciever.code,
      department: storeReciever.department._id,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("Edited store reciever", form);
    try {
      const res = await fetch(
        `${environment.url}/api/store/edit-receiver/${id}`,
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
        setRecievers((preRes)=> preRes.map((existingRes)=> existingRes._id === data.udpatedReceiver._id ? data.udpatedReceiver : existingRes))
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteStoreReciever = async (storeRecieverId) => {
    // console.log(storeRecieverId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-receiver/${storeRecieverId}`,
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
        setRecievers((prevRes) =>
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

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setForm((prevData) => ({
      ...prevData,
      department: selectedDepartment,
    }));
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  return (
    <div className="pharmacy-list">
      <h2>Store Recievers</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="pharmacy-add-btn"
        >
          Add Store Reciever
        </button>
      </div>
      <hr className="am-h-line" />

      {/* Render the medications in a professional table */}
      {loading ? (
        <Loader />
      ) : (
        <table className="pharmacy-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Code</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recievers && recievers.length > 0 ? (
              recievers.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store?.name || "N/A"}</td>
                  <td>{store?.code}</td>
                  <td>{store?.phone}</td>
                  <td>{store?.department?.name}</td>
                  <td className="ipd-consumable-icons" style={{display: "flex", gap: "10px"}}>
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="icon"
                      onClick={() => handleEditing(store)}
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="icon"
                      onClick={() => handleDeleteStoreReciever(store._id)}
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

      <AddStoreReciever
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStoreReciever={handleAddStoreReciever}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{height:"55%", width: "50%"}}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Store Reciever</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  name="phone"
                  onChange={handleChange}
                  value={form.phone}
                />
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Code:</label>
                <input
                  type="text"
                  name="code"
                  onChange={handleChange}
                  value={form.code}
                />
              </div>
              <div className="form-group">
                <label>Department </label>
                <select
                  value={form.department}
                  onChange={handleDepartmentChange}
                  style={{ padding: "8px" }}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit">Update Store Reciever</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreRecievers;

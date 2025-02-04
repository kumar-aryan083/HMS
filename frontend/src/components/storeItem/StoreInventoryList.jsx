import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import AddStoreInventory from "./AddStoreInventory";
import Loader from "../Loader";

const StoreInventoryList = () => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeInventories, setStoreInventories] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    rate: "",
    gstn: "",
    vendor: "",
    purchasedBy: "",
    department: "",
    departmentName: "",
    date: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const handleDepartmentChange = (e) => {
    const selectedDepartmentId = e.target.value;
    const selectedDepartment = departments.find(
      (dept) => dept._id === selectedDepartmentId
    );
    setForm((prevData) => ({
      ...prevData,
      department: selectedDepartmentId,
      departmentName: selectedDepartment.name,
    }));
  };

  const editRef = useRef();

  useEffect(() => {
    fetchInventories();
    fetchDepartments();
  }, []);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/store/get-store-inventories`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setStoreInventories(data.storeInventories);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStoreInventory = async (storeItem) => {
    //   console.log("added store inventory: ", storeItem);
    try {
      const res = await fetch(
        `${environment.url}/api/store/add-store-inventory`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(storeItem),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        fetchInventories();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (storeItem) => {
    //   console.log(storeItem);
    editRef.current.style.display = "flex";
    setId(storeItem._id);
    setForm({
      name: storeItem.name,
      quantity: storeItem.quantity,
      rate: storeItem.rate,
      gstn: storeItem.gstn,
      vendor: storeItem.vendor,
      purchasedBy: storeItem.purchasedBy,
      department: storeItem.department,
      date: storeItem.name,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    //   console.log("Edited store inventory", form);
    try {
      const res = await fetch(
        `${environment.url}/api/store/edit-store-inventory/${id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchInventories();
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteStoreItem = async (storeItemId) => {
    // console.log(storeItemId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-store-inventory/${storeItemId}`,
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
        fetchInventories();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  return (
    <div className="consumable-list">
      <h2>Store Inventories</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="add-consumable-btn"
        >
          Add Store Inventory
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
              <th>Name</th>
              <th>Rate</th>
              <th>Quantity</th>
              <th>GSTN</th>
              <th>Vendor</th>
              <th>Purchased By</th>
              <th>Department</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {storeInventories && storeInventories.length > 0 ? (
              storeInventories.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store.name || "N/A"}</td>
                  <td>{store.rate}</td>
                  <td>{store.quantity}</td>
                  <td>{store.gstn}</td>
                  <td>{store.vendor}</td>
                  <td>{store.purchasedBy}</td>
                  <td>{store.departmentName}</td>
                  <td>{new Date(store.date).toLocaleDateString()}</td>
                  <td className="ipd-consumable-icons">
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      className="consumable-icon"
                      onClick={() => handleEditing(store)}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      title="Delete"
                      className="consumable-icon"
                      onClick={() => handleDeleteStoreItem(store._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  No Store Items assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <AddStoreInventory
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStoreInventory={handleAddStoreInventory}
        departments={departments}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="closeBtn">
            X
          </button>
          <h3>Edit Store Inventory</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  onChange={handleChange}
                  value={form.quantity}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rate:</label>
                <input
                  type="number"
                  name="rate"
                  onChange={handleChange}
                  value={form.rate}
                  required
                />
              </div>
              <div className="form-group">
                <label>GSTN:</label>
                <input
                  type="text"
                  name="gstn"
                  onChange={handleChange}
                  value={form.gstn}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vendor:</label>
                <input
                  type="text"
                  name="vendor"
                  onChange={handleChange}
                  value={form.vendor}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purchased By:</label>
                <input
                  type="text"
                  name="purchasedBy"
                  onChange={handleChange}
                  value={form.purchasedBy}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={form.department}
                  onChange={handleDepartmentChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  onChange={handleChange}
                  value={form.date}
                />
              </div>
            </div>

            <button type="submit">Update Store Inventory</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreInventoryList;

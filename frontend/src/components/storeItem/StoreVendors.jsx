import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/StoreItemList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddStoreCategory from "./AddStoreCategory";
import AddStoreReciever from "./AddStoreReciever";
import AddStoreVendor from "./AddStoreVendor";

const StoreVendors = () => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
      companyName: "",
      gstNo: "",
      contactPerson: "",
      contactNo1: "",
      contactNo2: "",
      address: "",
    });
  const [loading, setLoading] = useState(false);

  const editRef = useRef();

  useEffect(() => {
    fetchStoreVendors();
  }, []);

  const fetchStoreVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/store/get-vendors`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setVendors(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };


  const handleAddStoreVendor = async (storeVendor) => {
    // console.log("added store vendor: ", storeVendor);
    try {
      const res = await fetch(`${environment.url}/api/store/add-vendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(storeVendor),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setVendors((prev) => [...prev, data.newVendor]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (storeVendor) => {
    // console.log(storeVendor);
    editRef.current.style.display = "flex";
    setId(storeVendor._id);
    setForm({
        companyName: storeVendor.companyName,
        gstNo: storeVendor.gstNo,
        contactPerson: storeVendor.contactPerson,
        contactNo1: storeVendor.contactNo1,
        contactNo2: storeVendor.contactNo2,
        address: storeVendor.address,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("Edited store vendor", form);
    try {
      const res = await fetch(
        `${environment.url}/api/store/edit-vendor/${id}`,
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
        setVendors((pre)=> pre.map((existing)=> existing._id === data.udpatedVendor._id ? data.udpatedVendor : existing))
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteStoreVendor = async (storeVendorId) => {
    // console.log(storeVendorId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-vendor/${storeVendorId}`,
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
        setVendors((prev) =>
          prev.filter((res) => res._id !== data.deleted._id)
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

  return (
    <div className="pharmacy-list">
      <h2>Store Vendors</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="pharmacy-add-btn"
        >
          Add Store Vendor
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
              <th>Company Name</th>
              <th>GST No.</th>
              <th>Contact Person</th>
              <th>Contact 1</th>
              <th>Contact 2</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors && vendors.length > 0 ? (
              vendors.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store.companyName || "N/A"}</td>
                  <td>{store.gstNo}</td>
                  <td>{store.contactPerson}</td>
                  <td>{store.contactNo1}</td>
                  <td>{store.contactNo2}</td>
                  <td>{store.address}</td>
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
                      onClick={() => handleDeleteStoreVendor(store._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No Store vendors assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <AddStoreVendor
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStoreVendor={handleAddStoreVendor}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Store Vendor</h3>
          <form onSubmit={handleEditSubmit}>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Company Name:</label>
              <input
                type="text"
                name="companyName"
                onChange={handleChange}
                value={form.companyName}
              />
            </div>
            <div className="form-group">
              <label>GST No. :</label>
              <input
                type="text"
                name="gstNo"
                onChange={handleChange}
                value={form.gstNo}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Contact Person:</label>
              <input
                type="text"
                name="contactPerson"
                onChange={handleChange}
                value={form.contactPerson}
              />
            </div>
            <div className="form-group">
              <label>Contact Number 1:</label>
              <input
                type="text"
                name="contactNo1"
                onChange={handleChange}
                value={form.contactNo1}
              />
            </div>
            <div className="form-group">
              <label>Contact Number 2:</label>
              <input
                type="text"
                name="contactNo2"
                onChange={handleChange}
                value={form.contactNo2}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              id="store-vendor-address"
              value={form.address}
              onChange={handleChange}
              rows={5}
              style={{outline: "none"}}
            />
          </div>

            <button type="submit">Update Store Vendor</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreVendors;

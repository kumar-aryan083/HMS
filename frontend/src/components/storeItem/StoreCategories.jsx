import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/StoreItemList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddStoreCategory from "./AddStoreCategory";

const StoreCategories = () => {
  const { setNotification } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    name: "",
    status: ""
  });
  const [loading, setLoading] = useState(false);

  const editRef = useRef();

  useEffect(() => {
    fetchStoreCategories();
  }, []);

  const fetchStoreCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/store/get-categories`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setCategories(data.categories);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStoreCategory = async (storeCategory) => {
    // console.log("added store category: ", storeCategory);
    try {
      const res = await fetch(`${environment.url}/api/store/add-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(storeCategory),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setCategories((prevCat)=> [...prevCat, data.newCategory])
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (storeCategory) => {
    // console.log(storeCategory);
    editRef.current.style.display = "flex";
    setId(storeCategory._id);
    setForm({
      name: storeCategory.name,
      status: storeCategory.status,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("Edited store category", form);
    try {
      const res = await fetch(
        `${environment.url}/api/store/edit-category/${id}`,
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
        setCategories((preCat)=> preCat.map((existingCat)=> existingCat._id === data.udpatedCategory._id ? data.udpatedCategory : existingCat))
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteStoreCategory = async (storeCategoryId) => {
    // console.log(storeCategoryId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-category/${storeCategoryId}`,
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
        setCategories((prevCat)=> prevCat.filter((cat)=> cat._id !== data.deleted._id));
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
        [name]: value
    })
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  return (
    <div className="pharmacy-list">
      <h2>Store Categories</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="pharmacy-add-btn"
        >
          Add Store Category
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories && categories.length > 0 ? (
              categories.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store.name || "N/A"}</td>
                  <td>{store.status}</td>
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
                      onClick={() => handleDeleteStoreCategory(store._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No Store Categories assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <AddStoreCategory
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStoreCategory={handleAddStoreCategory}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{height:"60%", width: "30%"}}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Store Category</h3>
          <form onSubmit={handleEditSubmit}>
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
              <label>Status:</label>
              <select
                name="status"
                id="cast-status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button type="submit">Update Store Category</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreCategories;

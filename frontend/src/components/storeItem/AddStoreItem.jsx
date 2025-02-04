import React, { useState } from "react";
import { useEffect } from "react";
import { environment } from "../../../utlis/environment";

const AddStoreItem = ({ isOpen, onClose, onAddStoreItem }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    code: "",
    rate: "",
    gst: "",
    mrp: "",
    buffer: "",
    stockQuantity: "",
    category: "",
    categoryName: ""
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
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
      } 
    };

  const handleChange = (e) => {
    const {name, value} = e.target;
    if(name === "category"){
      const selectedCategory = categories.find((cat)=> cat._id === value);
      setForm({
        ...form,
        category: value,
        categoryName: selectedCategory ? selectedCategory.name : ""
      })
    }else{
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddStoreItem(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{height:"70%", width: "50%"}}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3>Add New Store Item</h3>
        <form onSubmit={handleSubmit}>
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
              <label>Code:</label>
              <input
                type="text"
                name="code"
                onChange={handleChange}
                value={form.code}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Rate:</label>
              <input
                type="number"
                name="rate"
                onChange={handleChange}
                value={form.rate}
              />
            </div>
            <div className="form-group">
              <label>GST(%):</label>
              <input
                type="text"
                name="gst"
                onChange={handleChange}
                value={form.gst}
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity:</label>
              <input
                type="text"
                name="stockQuantity"
                onChange={handleChange}
                value={form.stockQuantity}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>MRP:</label>
              <input
                type="number"
                name="mrp"
                onChange={handleChange}
                value={form.mrp}
              />
            </div>
            <div className="form-group">
              <label>Buffer:</label>
              <input
                type="text"
                name="buffer"
                onChange={handleChange}
                value={form.buffer}
              />
            </div>
            <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ padding: "8px" }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
          </div>
          <button type="submit">Add Store Item</button>
        </form>
      </div>
    </div>
  );
};

export default AddStoreItem;

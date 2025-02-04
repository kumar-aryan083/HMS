import React, { useContext, useState } from "react";
import "./styles/AddRack.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const AddRack = () => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    store: "",
    rackNo: "",
    description: "",
    parentRack: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Rack Added:", formData);
    try {
      const res = await fetch(`${environment.url}/api/pharmacy/add-rack`, {
        method: "POST",
        headers: {
          "x-tenant-id": environment.tenantId,
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setFormData({
          store: "",
          rackNo: "",
          description: "",
          parentRack: "",
        });
      } else {
        setNotification("something went wrong");
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  return (
    <div className="add-rack-container">
      <h2>Add Rack</h2>
      <form className="rack-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Store:
              <input
                type="text"
                name="store"
                value={formData.store}
                onChange={handleChange}
                placeholder="Store"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Rack Number:
              <input
                type="text"
                name="rackNo"
                value={formData.rackNo}
                onChange={handleChange}
                placeholder="Rack Number"
                required
              />
            </label>
          </div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Parent Rack:
              <input
                type="text"
                name="parentRack"
                value={formData.parentRack}
                onChange={handleChange}
                placeholder="Parent Rack"
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Description:
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                required
              />
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Add Rack
        </button>
      </form>
    </div>
  );
};

export default AddRack;

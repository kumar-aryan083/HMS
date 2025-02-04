import React, { useContext, useEffect, useState } from "react";
import "./styles/AddGeneric.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";

const AddGeneric = () => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    categoryName: "",
    categoryNumber: "",
    therapeuticCategoryNumber: "",
    counselingNumber: "",
    isActive: false,
  });
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/search-category`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setCategories(data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "categoryName") {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
      setShowSuggestions(true);
    }
  };

  const handleCategorySelect = (selectedCategory) => {
    setFormData({
      ...formData,
      categoryName: selectedCategory.name,
      category: selectedCategory._id,
    });
    setShowSuggestions(false); // Hide suggestions once a category is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Generic Added:", formData);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/add-generic-name`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setFormData({
          name: "",
          category: "",
          categoryName: "",
          categoryNumber: "",
          therapeuticCategoryNumber: "",
          counselingNumber: "",
          isActive: false,
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
    <div className="add-generic-container">
      <h2>Add Generic Name: </h2>
      <form className="generic-form" onSubmit={handleSubmit}>
        <div className="fg-group">
          <label>
            Generic Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name of Generic"
              required
            />
          </label>
        </div>
        <div className="form-row fg-group">
          <div className="form-group fg-group">
            <label>
              Select Category:
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                placeholder="Search Category"
                autoComplete="off"
                onFocus={() => setShowSuggestions(true)}
              />
            </label>
            {/* Suggestions List */}
            {showSuggestions && formData.categoryName && (
              <ul className="generic-suggestions-list">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category, index) => (
                    <li
                      key={index}
                      onClick={() => handleCategorySelect(category)}
                      className="generic-suggestion-item"
                    >
                      {category.name}
                    </li>
                  ))
                ) : (
                  <li className="generic-no-suggestion">
                    No suggestions found
                  </li>
                )}
              </ul>
            )}
          </div>
          <div className="form-group fg-group">
            <label>
              General Category Number:
              <input
                type="text"
                name="categoryNumber"
                value={formData.categoryNumber}
                onChange={handleChange}
                placeholder="General Category Number"
                required
              />
            </label>
          </div>
        </div>

        <div className="form-row fg-group">
          <div className="form-group fg-group">
            <label>
              Therapeutic Category Number:
              <input
                type="text"
                name="therapeuticCategoryNumber"
                value={formData.therapeuticCategoryNumber}
                onChange={handleChange}
                placeholder="Therapeutic Category Number"
                required
              />
            </label>
          </div>
          <div className="form-group fg-group">
            <label>
              Counseling Number:
              <input
                type="text"
                name="counselingNumber"
                value={formData.counselingNumber}
                onChange={handleChange}
                placeholder="Counseling Number"
                required
              />
            </label>
          </div>
        </div>

        <div className="cb-inpts">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Is Active
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Add Generic Name
        </button>
      </form>
    </div>
  );
};

export default AddGeneric;

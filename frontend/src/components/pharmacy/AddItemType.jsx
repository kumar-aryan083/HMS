import React, { useContext, useEffect, useState } from "react";
import "./styles/AddItemType.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import AsyncSelect from "react-select/async";

const AddItemType = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  isEdit,
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    categoryName: "",
    category: "",
    isActive: false,
  });
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [preloadData, setPreloadData] = useState({
    categories: [],
  });

  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
    }
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/get-categories`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        const categories = data.items.map((supplier) => {
          return {
            label: supplier.name,
            value: supplier._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          categories: categories,
        }));
      } else {
        setNotification("Failed to fetch company list");
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      setNotification("Server error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // if (name === "categoryName") {
    //   const filtered = categories.filter((cat) =>
    //     cat.name.toLowerCase().includes(value.toLowerCase())
    //   );
    //   setFilteredCategories(filtered);
    //   setShowSuggestions(true);
    // }
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
    // console.log("Item Type Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
        const res = await fetch(
          `${environment.url}/api/pharmacy/add-item-type`,
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
            type: "",
            description: "",
            categoryName: "",
            category: "",
            isActive: false,
          });
          toggleConsumablesPopup();
        } else {
          setNotification("something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };
  return (
    <div className="add-itemType-container">
      <h2>{isEdit ? "Update Item Type" : "Add Item Type"} </h2>
      <form className="itemType-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group ">
            <label>
              Type of Item
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="Type of Item"
                required
                style={{ marginTop: "0" }}
              />
            </label>
          </div>
          <div className="form-group fg-group">
            <label>
              Select Category:
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) =>
                  Promise.resolve(
                    preloadData.categories.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  )
                }
                defaultOptions={preloadData.categories}
                value={{
                  label: formData.categoryName,
                  value: formData.category,
                }}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e?.value || "",
                    categoryName: e?.label || "",
                  })
                }
                placeholder="Select Category"
                isClearable
                required
              />
            </label>
          </div>
        </div>

        <div className="fg-group">
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

        <button type="submit" className="submit-btn" style={{backgroundColor: "var(--secondBase)", margin: "0"}}>
          {isEdit ? "Update Type" : "Add Type of Item"}
        </button>
      </form>
    </div>
  );
};

export default AddItemType;

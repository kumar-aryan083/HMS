import React, { useContext, useEffect, useState } from "react";
import "./styles/AddSupplier.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import AsyncSelect from "react-select/async";

const AddMedicine = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  isEdit,
}) => {
  const { setNotification, user } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    categoryName: "",
    description: "",
    batchNumber: "",
    expiryDate: "",
    pricePerUnit: "",
    stockQuantity: "",
    supplierID: "",
    supplierName: "",
    companyName: "",
    company: "",
    uom: "",
    uomId: "",
    itemType: "",
    itemTypeId: "",
  });
  const [preloadData, setPreloadData] = useState({
    supplierList: [],
    categoryList: [],
    companyList: [],
    UOMList: [],
    itemType: [],
  });

  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
    }
    fetchCategoryList();
    fetchSupplierList();
    fetchCompany();
    fetchUOM();
    fetchItemType();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const fetchSupplierList = async () => {
    try {
      const res = await fetch(`${environment.url}/api/pharmacy/get-suppliers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        const supplierList = data.items.map((supplier) => {
          return {
            label: supplier.name,
            value: supplier._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          supplierList: supplierList,
        }));
      } else {
        setNotification("Failed to fetch company list");
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      setNotification("Server error");
    }
  };

  const fetchCompany = async () => {
    try {
      const res = await fetch(`${environment.url}/api/pharmacy/get-companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        const supplierList = data.items.map((supplier) => {
          return {
            label: supplier.name,
            value: supplier._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          companyList: supplierList,
        }));
      } else {
        setNotification("Failed to fetch company list");
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      setNotification("Server error");
    }
  };

  const fetchUOM = async () => {
    try {
      const res = await fetch(`${environment.url}/api/pharmacy/get-uoms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        const supplierList = data.items.map((supplier) => {
          return {
            label: supplier.uom,
            value: supplier._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          UOMList: supplierList,
        }));
      } else {
        setNotification("Failed to fetch company list");
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      setNotification("Server error");
    }
  };

  const fetchItemType = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/get-item-types`,
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
        const supplierList = data.items.map((supplier) => {
          return {
            label: supplier.type,
            value: supplier._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          itemType: supplierList,
        }));
      } else {
        setNotification("Failed to fetch company list");
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      setNotification("Server error");
    }
  };

  const fetchCategoryList = async () => {
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
        const categoryList = data.items.map((category) => {
          return {
            label: category.name,
            value: category._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          categoryList: categoryList,
        }));
      } else {
        setNotification("Failed to fetch company list");
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      setNotification("Server error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Medicine Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
        const res = await fetch(
          `${environment.url}/api/pharmacy/add-medicine`,
          {
            method: "POST",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
            body: JSON.stringify(
              Object.fromEntries(
                Object.entries(formData).filter(
                  ([_, value]) =>
                    value !== null && value !== undefined && value !== ""
                )
              )
            ),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setNotification(data.message);
          setFormData({
            name: "",
            category: "",
            categoryName: "",
            description: "",
            batchNumber: "",
            expiryDate: "",
            pricePerUnit: "",
            stockQuantity: "",
            supplierID: "",
            supplierName: "",
            companyName: "",
            company: "",
            uom: "",
            uomId: "",
            itemType: "",
            itemTypeId: "",
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
    <div className="add-supplier-container">
      <h2>{!isEdit ? "Add New Medicine" : "Update Medicine"}</h2>
      <form className="supplier-form" onSubmit={handleSubmit}>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                style={{ margin: "0" }}
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Category:
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadData.categoryList.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadData.categoryList} // Show all options initially
                value={preloadData.categoryList.find(
                  (category) => category.value === formData.category
                )}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    category: e?.value || "",
                    categoryName: e?.label || "",
                  });
                }}
                placeholder="Select Category"
                isClearable
              />
              {/* <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                required
              /> */}
            </label>
          </div>
          <div className="form-group">
            <label>
              Company:
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadData.companyList.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadData.companyList} // Show all options initially
                value={preloadData.companyList.find(
                  (category) => category.value === formData.company
                )}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    company: e?.value || "",
                    companyName: e?.label || "",
                  });
                }}
                placeholder="Select Company"
                isClearable
              />
              {/* <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                required
              /> */}
            </label>
          </div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>
              UOM:
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadData.UOMList.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadData.UOMList} // Show all options initially
                value={preloadData.UOMList.find(
                  (category) => category.value === formData.uomId
                )}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    uomId: e?.value || "",
                    uom: e?.label || "",
                  });
                }}
                placeholder="Select UOM"
                isClearable
              />
              {/* <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                required
              /> */}
            </label>
          </div>
          <div className="form-group">
            <label>
              Item Type:
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadData.itemType.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadData.itemType} // Show all options initially
                value={preloadData.itemType.find(
                  (category) => category.value === formData.itemTypeId
                )}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    itemTypeId: e?.value || "",
                    itemType: e?.label || "",
                  });
                }}
                placeholder="Select Item Type"
                isClearable
              />
              {/* <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                required
              /> */}
            </label>
          </div>
          <div className="form-group">
            <label>
              Batch Number:
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="Batch Number"
                style={{ margin: "0" }}
              />
            </label>
          </div>
        </div>
        <div className="form-row fg-group">
          {(user?.role === "admin" || (user?.role !== "admin" && !isEdit)) && (
            <div className="form-group">
              <label>
                Price Per Unit:
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="Price Per Unit"
                  style={{ margin: "0" }}
                />
              </label>
            </div>
          )}
          <div className="form-group">
            <label>
              Stock Quantity:
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="Stock Quantity"
                style={{ margin: "0" }}
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Supplier ID:
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) => {
                  return Promise.resolve(
                    preloadData.supplierList.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  );
                }}
                defaultOptions={preloadData.supplierList}
                value={preloadData.supplierList.find(
                  (supplier) => supplier.value === formData.supplierID
                )}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    supplierID: e?.value || "",
                    supplierName: e?.label || "",
                  });
                }}
                placeholder="Select Supplier"
                isClearable
              />
            </label>
          </div>
        </div>

        <div className="form-row fg-group">
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
          <div className="form-group">
            <label>
              Expiry Date:
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          style={{
            backgroundColor: "var(--secondBase)",
            fontWeight: "500",
            margin: "0",
          }}
        >
          {isEdit ? "Update Medicine" : "Add Medicine"}
        </button>
      </form>
    </div>
  );
};

export default AddMedicine;

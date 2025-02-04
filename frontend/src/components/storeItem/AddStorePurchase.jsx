import React, { useState, useEffect } from "react";
import "./styles/AddStoreSupply.css";
import { environment } from "../../../utlis/environment";

const AddStorePurchase = ({ isOpen, onClose, onAddPurchase }) => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredItemsList, setFilteredItemsList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([
    { id: "", name: "", quantity: 1 },
  ]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    vendorId: "",
    vendorName: "",
    phone: "",
    address: "",
    items: [],
  });

  useEffect(() => {
    fetchVendors();
    fetchItems();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${environment.url}/api/store/get-vendors`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setVendors(data.items);
        setFilteredVendors(data.items);
      }
    } catch (error) {
      console.error("Error fetching receivers:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${environment.url}/api/store/get-store-items`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log("store items", data);
        setItems(data.storeItems);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    if (value.length > 2) {
      const filtered = vendors.filter((vendor) =>
        vendor.companyName.toLowerCase().includes(value)
      );
      setFilteredVendors(filtered);
    } else {
        setFilteredVendors([]);
    }
  };

  const handleSelectVendor = (vendor) => {
    setForm((prevForm) => ({
      ...prevForm,
      vendorId: vendor._id,
      vendorName: vendor.companyName,
      phone: vendor.contactNo1 || "",
      address: vendor.address || "",
    }));
    setSearch(vendor.companyName);
    setFilteredVendors([]);
  };

  const handleItemSearch = (index, value) => {
    handleItemChange(index, "name", value);

    if (value.length > 2) {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItemsList((prev) => {
        const updatedList = [...prev];
        updatedList[index] = filtered; // Store filtered items for the specific row
        return updatedList;
      });
    } else {
      setFilteredItemsList((prev) => {
        const updatedList = [...prev];
        updatedList[index] = []; // Clear suggestions for the row
        return updatedList;
      });
    }
  };

  const handleSelectItem = (index, item) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = { ...item, quantity: 1 };
    setSelectedItems(updatedItems);

    // Clear suggestions for this input
    setFilteredItemsList((prev) => {
      const updatedList = [...prev];
      updatedList[index] = [];
      return updatedList;
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...selectedItems];
    updatedItems[index][field] = value;
    setSelectedItems(updatedItems);
  };

  const addItemRow = () => {
    setSelectedItems((prevItems) => [
      ...prevItems,
      { id: "", name: "", quantity: 1 },
    ]);
  };

  const removeItemRow = (index) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
  };

  const handleQuantityChange = (itemId, quantity) => {
    const updatedItems = selectedItems.map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    );
    setSelectedItems(updatedItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transformedItems = selectedItems.map((item) => ({
      ...item,
      itemId: item._id, // Rename _id to itemId
      _id: undefined, // Remove the original _id if necessary
    }));

    onAddPurchase({ ...form, items: transformedItems });
    setForm({
      vendorId: "",
      vendorName: "",
      phone: "",
      address: "",
      items: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="supply-modal-overlay">
      <div className="supply-modal-content">
        <button className="opd-closeBtn" onClick={onClose}>
          X
        </button>
        <h3>Add Store Purchase</h3>
        <div className="form-row fg-group">
          <div className="form-group supply-search-bar">
            <label>Vendor</label>
            <input
              type="text"
              placeholder="Search Vendor..."
              value={search}
              onChange={handleSearch}
            //   style={{width: "fit-content"}}
            />
            {search.length > 2 && filteredVendors.length > 0 && (
              <ul className="supply-receiver-list">
                {filteredVendors.map((vendor) => (
                  <li
                    key={vendor._id}
                    onClick={() => handleSelectVendor(vendor)}
                    className="supply-receiver-item"
                  >
                    {vendor.companyName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="text" value={form.phone} readOnly/>
          </div>
          
        </div>
        <form onSubmit={handleSubmit}>
          <h4>Items</h4>
          {selectedItems.map((item, index) => (
            <div key={index} className="form-row fg-group supply-item-entry">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) => handleItemSearch(index, e.target.value)}
                />
                {filteredItemsList[index]?.length > 0 && (
                  <ul className="supply-item-list">
                    {filteredItemsList[index].map((filteredItem) => (
                      <li
                        key={filteredItem._id}
                        onClick={() => handleSelectItem(index, filteredItem)}
                        className="supply-item"
                      >
                        {filteredItem.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="supply-item-quantity">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="remove-item-btn"
                >
                  -
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addItemRow} className="add-item-btn">
            Add Item
          </button>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default AddStorePurchase;

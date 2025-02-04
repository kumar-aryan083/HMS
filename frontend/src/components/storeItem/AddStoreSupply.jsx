import React, { useState, useEffect } from "react";
import "./styles/AddStoreSupply.css";
import { environment } from "../../../utlis/environment";

const AddStoreSupply = ({ isOpen, onClose, onAddSupply }) => {
  const [receivers, setReceivers] = useState([]);
  const [filteredReceivers, setFilteredReceivers] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredItemsList, setFilteredItemsList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([
    { id: "", name: "", quantity: 1 },
  ]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    receiverId: "",
    department: "",
    departmentName: "",
    phone: "",
    status: "received",
    items: [],
  });

  useEffect(() => {
    fetchReceivers();
    fetchItems();
  }, []);

  const fetchReceivers = async () => {
    try {
      const res = await fetch(`${environment.url}/api/store/get-receivers`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setReceivers(data.items);
        setFilteredReceivers(data.items);
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
      const filtered = receivers.filter((receiver) =>
        receiver.name.toLowerCase().includes(value)
      );
      setFilteredReceivers(filtered);
    } else {
      setFilteredReceivers([]);
    }
  };

  const handleSelectReceiver = (receiver) => {
    setForm((prevForm) => ({
      ...prevForm,
      receiverId: receiver._id,
      department: receiver.department._id || "",
      departmentName: receiver.department?.name || "",
      phone: receiver.phone || "",
    }));
    setSearch(receiver.name);
    setFilteredReceivers([]);
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

    onAddSupply({ ...form, items: transformedItems });
    setForm({
      receiverId: "",
      department: "",
      departmentName: "",
      phone: "",
      status: "received",
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
        <h3>Add Store Supply</h3>
        <div className="form-row fg-group">
          <div className="form-group supply-search-bar">
            <label>Reciever</label>
            <input
              type="text"
              placeholder="Search Receiver..."
              value={search}
              onChange={handleSearch}
            />
            {search.length > 2 && filteredReceivers.length > 0 && (
              <ul className="supply-receiver-list">
                {filteredReceivers.map((receiver) => (
                  <li
                    key={receiver._id}
                    onClick={() => handleSelectReceiver(receiver)}
                    className="supply-receiver-item"
                  >
                    {receiver.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              id="supply-status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="received">Received</option>
              <option value="due">Due</option>
            </select>
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

export default AddStoreSupply;

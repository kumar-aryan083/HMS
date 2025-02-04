import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/StoreItemList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPrint, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddStoreSupply from "./AddStoreSupply";
import { useReactToPrint } from "react-to-print";
import StoreSupplyPrint from "./StoreSupplyPrint";

const StoreSupplies = () => {
  const { setNotification, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplies, setSupplies] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    receiverId: "",
    department: "",
    departmentName: "",
    phone: "",
    status: "received",
    items: [],
  });
  const [receivers, setReceivers] = useState([]);
  const [filteredReceivers, setFilteredReceivers] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredItemsList, setFilteredItemsList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([
    { id: "", name: "", quantity: 1 },
  ]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [storeSupply, setStoreSupply] = useState(null);

  const editRef = useRef();
  const printRef = useRef();

  const printSupply = useReactToPrint({
    contentRef: printRef
  })

  useEffect(() => {
    if (form.items.length > 0) {
      setSelectedItems(
        form.items.map((item) => ({
          ...item,
          quantity: item.quantity || 1, // Set default quantity to 1 if undefined
        }))
      );
    }
  }, [form.items]);

  useEffect(() => {
    fetchStoreSupplies();
    fetchReceivers();
    fetchItems();
  }, []);

  const handleSupplyPrint = (store)=>{
    // console.log(store);
    setStoreSupply(store);
    setTimeout(() => {
      printSupply();
    }, 50);
  }

  const fetchStoreSupplies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/store/get-supplies`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setSupplies(data.supplies);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };

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
    updatedItems[index] = { ...item, quantity: 1 }; // Preselect item and set default quantity
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

    if (field === "quantity") {
      updatedItems[index][field] = parseInt(value, 10) || 1; // Ensure quantity is always a number
    } else {
      updatedItems[index][field] = value; // Update non-quantity fields if needed
    }

    // Ensure that `itemId` is preserved if it's already set
    const currentItem = updatedItems[index];
    if (!currentItem.itemId && currentItem._id) {
      currentItem.itemId = currentItem._id; // Preserve itemId based on _id if itemId is missing
    }

    setSelectedItems(updatedItems);
  };

  const addItemRow = () => {
    setSelectedItems((prevItems) => [
      ...prevItems,
      { id: "", name: "", quantity: 1 }, // Add an empty row for the new item
    ]);
  };

  const removeItemRow = (index) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
  };

  const handleAddStoreSupply = async (storeSupply) => {
    // console.log("added store supply: ", storeSupply);
    try {
      const res = await fetch(`${environment.url}/api/store/add-supply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(storeSupply),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setSupplies((prev) => [...prev, data.newSupply]);
        // setVendors((prev) => [...prev, data.newVendor]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (storeSupply) => {
    // console.log("storesupply items", storeSupply.items);

    // console.log(storeSupply);
    editRef.current.style.display = "flex";
    setId(storeSupply._id);
    setForm({
      receiverId: storeSupply.receiverId?._id,
      department: storeSupply.department,
      departmentName: storeSupply.departmentName,
      phone: storeSupply.phone,
      status: storeSupply.status,
      items: storeSupply.items,
    });

    const receiver = receivers.find(
      (receiver) => receiver._id === storeSupply.receiverId._id
    );
    if (receiver) {
      setSearch(receiver.name); // Update the search state with the receiver's name
    }
    setFilteredReceivers([]);

    // Populate selectedItems with existing items, ensuring quantity is 1 if not defined
    setSelectedItems(
      storeSupply.items.map((item) => ({
        ...item,
        quantity: item.quantity || 1, // Set default quantity to 1 if undefined
      }))
    );
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("Edited Store Supply:", form);
    const transformedItems = selectedItems.map((item) => ({
      ...item,
      itemId: item.itemId || item._id, // Preserve itemId or use _id as fallback
      _id: undefined, // Remove _id if necessary
    }));
    const updatedStoreSupply = {
      ...form,
      items: transformedItems,
    };
    // console.log("edited data going to backend:", updatedStoreSupply);

    try {
      const res = await fetch(
        `${environment.url}/api/store/update-supply/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedStoreSupply),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSupplies((pre) =>
          pre.map((existing) =>
            existing._id === data.updatedSupply._id
              ? data.updatedSupply
              : existing
          )
        );
        setNotification(data.message);
        // setForm({
        //   receiverId: "",
        //   department: "",
        //   departmentName: "",
        //   phone: "",
        //   status: "received",
        //   items: [],
        // });
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteStoreSupply = async (storeSupplyId) => {
    // console.log(storeSupplyId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-supply/${storeSupplyId}`,
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
        setSupplies((prev) =>
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
      <h2>Store Supplies</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="pharmacy-add-btn"
        >
          Add Store Supply
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
              <th>Receiver</th>
              <th>Voucher No.</th>
              <th>Department</th>
              <th>Total Items</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {supplies && supplies.length > 0 ? (
              supplies.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store.receiverId?.name || "N/A"}</td>
                  <td>{store.voucherNo}</td>
                  <td>{store.departmentName}</td>
                  <td>{store.items.length}</td>
                  <td>{store.phone}</td>
                  <td>{store.status.toUpperCase()}</td>
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
                      onClick={() => handleDeleteStoreSupply(store._id)}
                    />
                    <FontAwesomeIcon
                      icon={faPrint}
                      title="Print"
                      className="icon"
                      onClick={() => handleSupplyPrint(store)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No Store Supplies assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <AddStoreSupply
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSupply={handleAddStoreSupply}
      />
      <StoreSupplyPrint printSupplyRef={printRef} storeSupply={storeSupply} user={user} />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{height: "70%"}}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Store Supply</h3>
          <form onSubmit={handleEditSubmit}>
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
            <button type="submit">Update Store Supply</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreSupplies;

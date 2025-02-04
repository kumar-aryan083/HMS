import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/StoreItemList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPrint, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import AddStoreSupply from "./AddStoreSupply";
import AddStorePurchase from "./AddStorePurchase";
import { useReactToPrint } from "react-to-print";
import StorePurchasePrint from "./StorePurchasePrint";

const StorePurchases = () => {
  const { setNotification, user } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [id, setId] = useState("");
  const [form, setForm] = useState({
    vendorId: "",
    vendorName: "",
    phone: "",
    address: "",
    items: [],
  });
    const [vendors, setVendors] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredItemsList, setFilteredItemsList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([
    { id: "", name: "", quantity: 1 },
  ]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [storePurchase, setStorePurchase] = useState(null)

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
          quantity: item.quantity || 1, 
        }))
      );
    }
  }, [form.items]);

  useEffect(() => {
    fetchStorePurchases();
    fetchVendors();
    fetchItems();
  }, []);

  const handleSupplyPrint = (store)=>{
    // console.log(store);
    setStorePurchase(store);
    setTimeout(() => {
      printSupply();
    }, 50);
  }

  const fetchStorePurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/store/get-purchase-orders`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setPurchases(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
    setLoading(false);
  };

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
      updatedItems[index][field] = parseInt(value, 10) || 1; 
    } else {
      updatedItems[index][field] = value; 
    }

    // Ensure that `itemId` is preserved if it's already set
    const currentItem = updatedItems[index];
    if (!currentItem.itemId && currentItem._id) {
      currentItem.itemId = currentItem._id; 
    }

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

  const handleAddStorePurchase = async (storePurchase) => {
    // console.log("added store purchase: ", storePurchase);
    try {
      const res = await fetch(`${environment.url}/api/store/add-purchase-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(storePurchase),
      });
      const data = await res.json();
      if (res.ok) {
        // console.log();
        setNotification(data.message);
        setIsModalOpen(false);
        setPurchases((prev) => [...prev, data.newItem]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditing = (storePurchase) => {
    // console.log("store purchase items", storePurchase.items);

    // console.log(storePurchase);
    editRef.current.style.display = "flex";
    setId(storePurchase._id);
    setForm({
      vendorId: storePurchase.vendorId,
      vendorName: storePurchase.companyName,
      phone: storePurchase.phone,
      address: storePurchase.address,
      items: storePurchase.items,
    });

    const vendor = vendors.find(
      (vendor) => vendor._id === storePurchase.vendorId
    );
    if (vendor) {
      setSearch(vendor.companyName);
    }
    setFilteredVendors([]);

    // Populate selectedItems with existing items, ensuring quantity is 1 if not defined
    setSelectedItems(
        storePurchase.items.map((item) => ({
        ...item,
        quantity: item.quantity || 1, // Set default quantity to 1 if undefined
      }))
    );
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("Edited Store Purchase:", form);
    const transformedItems = selectedItems.map((item) => ({
      ...item,
      itemId: item.itemId || item._id, 
      _id: undefined, 
    }));
    const updatedStorePurchase = {
      ...form,
      items: transformedItems,
    };
    // console.log("edited data going to backend:", updatedStorePurchase);

    try {
      const res = await fetch(
        `${environment.url}/api/store/edit-purchase-order/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedStorePurchase),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPurchases((pre) =>
          pre.map((existing) =>
            existing._id === data.udpatedPurchaseOrder._id
              ? data.udpatedPurchaseOrder
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

  const handleDeleteStorePurchase = async (storePurchaseId) => {
    // console.log(storePurchaseId);
    try {
      const res = await fetch(
        `${environment.url}/api/store/delete-purchase-order/${storePurchaseId}`,
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
        setPurchases((prev) =>
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
      <h2>Store Purchases</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="pharmacy-add-btn"
        >
          Add Store Purchase
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
              <th>Puchase Number</th>
              <th>Vendor</th>
              {/* <th>Purchase No.</th> */}
              <th>Total Items</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases && purchases.length > 0 ? (
              purchases.map((store, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{store.purchaseNo}</td>
                  <td>{store.vendorName || "N/A"}</td>
                  {/* <td>{store.purchaseNo}</td> */}
                  <td>{store.items.length}</td>
                  <td>{store.phone}</td>
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
                      onClick={() => handleDeleteStorePurchase(store._id)}
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
                <td colSpan="7" className="no-data">
                  No Store Purchase ordered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <AddStorePurchase
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPurchase={handleAddStorePurchase}
      />
      <StorePurchasePrint printSupplyRef={printRef} storePurchase={storePurchase} user={user} />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{height: "70%"}}>
          <button type="button" onClick={handleClose} className="opd-closeBtn">
            X
          </button>
          <h3>Edit Store Purchase</h3>
          <form onSubmit={handleEditSubmit}>
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
            <button type="submit">Update Store Purchase</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StorePurchases;

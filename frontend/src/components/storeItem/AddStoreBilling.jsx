import React, { useCallback, useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";
import "./styles/AddStoreBilling.css";
import SearchableDropdown from "../ipd/SearchableDropdown";

const AddStoreBilling = ({ isOpen, onClose, onAddBilling }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    itemId: "",
    code: "",
    name: "OT ",
    category: "",
    categoryName: "",
    rate: "",
    gst: "",
    mrp: "",
    buffer: "",
    stockQuantity: "",
    quantity: 1,
    discount: ""
  });

  const [payments, setPayments] = useState({
    paymentType: "card",
    transactionId: "",
    paymentAmount: "",
  });

  const [grandTotals, setGrandTotals] = useState({
    totalCharge: 0,
    totalDiscount: 0,
    finalDiscounted: 0,
    finalPrice: 0,
  });

  const [items, setItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [itemSearch, setItemSearch] = useState(""); // Separate state for item search
  const [vendorSearch, setVendorSearch] = useState(""); // Separate state for vendor search
  const [vendors, setVendors] = useState([]); // Vendor suggestions
  const [selectedVendor, setSelectedVendor] = useState(null); // Selected vendor
  const [purchaseNumber, setPurchaseNumber] = useState(""); // Purchase number
  const [showItemDropdown, setShowItemDropdown] = useState(false); // Separate state for item dropdown visibility
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [addedItems, setAddedItems] = useState([]);

  const fetchStoreItems = async (query) => {
    if (!query) {
      setItemOptions([]);
      return;
    }
    try {
      const response = await fetch(
        `${environment.url}/api/store/search-store-items?search=${query}`,
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
      if (response.ok) {
        const data = await response.json();
        // console.log("store items", data);
        setItemOptions(data.storeItems);
        setShowItemDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching store items:", error);
    }
  };

  const fetchVendors = async (query) => {
    if (!query) {
      setVendors([]);
      return;
    }
    try {
      const response = await fetch(
        `${environment.url}/api/store/search-vendors?search=${query}`,
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
      if (response.ok) {
        const data = await response.json();
        // console.log("Vendor details:", data);
        setVendors(data.vendors);
        setShowVendorDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  // Debounced function for store item search
  const debouncedFetchStoreItems = useCallback(
    debounce(fetchStoreItems, 300),
    []
  );

  const handleStoreInputChange = (e) => {
    const value = e.target.value;
    setItemSearch(value);
    debouncedFetchStoreItems(value); // Pass the item search query
  };

  // Debounced function for vendor search
  const debouncedFetchVendors = useCallback(debounce(fetchVendors, 300), []);

  const handleVendorInputChange = (e) => {
    const value = e.target.value;
    setVendorSearch(value);
    debouncedFetchVendors(value); // Pass the vendor search query
  };

  const handleSelectItem = (item) => {
    // console.log("selected item", item);
    setItemSearch(item.name); // Set the search input to the item name
    setForm((prevForm) => ({
      ...prevForm,
      name: item.name, // Update the item name in form
      itemId: item._id, // Update the item ID
      charge: item.rate, // Update the item rate (charge)
      stockQuantity: item.stockQuantity, // Update stock quantity
      mrp: item.mrp, // Update MRP (if required)
      gst: item.gst, // Update GST (if required)
      category: item.category, // Update the category of the item
      categoryName: item.categoryName, // Set category name
      code: item.code,
      
    }));
    setShowItemDropdown(false);
  };

  const handleSelectVendor = (vendor) => {
    setVendorSearch(vendor.companyName);
    setSelectedVendor(vendor);
    setPurchaseNumber(vendor.purchaseNumber || "");
    setShowVendorDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!form.name || !form.charge) {
      // Show a message if required fields are missing
      // console.log("Please select a valid item with name and charge.");
      return;
    }

    const totalPrice = form.charge * form.quantity; // Calculate the item total price
    const itemDiscount = (totalPrice * form.discount) / 100; // Calculate item-specific discount
    const finalPrice = totalPrice - itemDiscount;

    // Add the selected item data to the list of added items
    setAddedItems((prevItems) => [
      ...prevItems,
      {
        itemId: form.itemId,
        name: form.name,
        charge: form.charge,
        stockQuantity: form.stockQuantity,
        gst: form.gst,
        category: form.category,
        categoryName: form.categoryName,
        code: form.code,
        quantity: form.quantity,
        totalPrice,
        discount: form.discount, // Add discount to each item
        finalPrice,
      },
    ]);

    // Clear the form or reset as needed after adding the item
    setForm({
      name: "",
      itemId: "",
      charge: "",
      stockQuantity: "",
      gst: "",
      category: "",
      categoryName: "",
      code: "",
      quantity: 1, // Reset quantity to 1
      discount: ""
    });
    setItemSearch("");
    // console.log("Item added:", form);
  };

  // Calculate Grand Totals
  useEffect(() => {
    let totalCharge = 0;
    let totalDiscount = 0;

    // Calculate total charge and total discount for all added items
    addedItems.forEach((item) => {
      const itemTotalPrice = item.charge * item.quantity; // Item total price before discount
      const itemDiscount = (itemTotalPrice * item.discount) / 100; // Calculate discount for item
      totalCharge += itemTotalPrice;
      totalDiscount += itemDiscount;
    });

    const finalPrice = totalCharge - totalDiscount; // Final price after discount

    setGrandTotals({
      totalCharge, // Total charge of all items
      totalDiscount, // Total discount applied on all items
      finalDiscounted: totalDiscount, // Total discount amount
      finalPrice, // Final price after applying total discount
    });
  }, [addedItems]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addedItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    // Collect all the necessary data for billing
    const billingData = {
      items: addedItems,
      vendorId: selectedVendor._id,
      vendorName: selectedVendor.companyName,
      purchaseOrderNumber: purchaseNumber,
    //   grandTotals: grandTotals,
      paymentInfo: {
        paymentType: payments.paymentType, // Payment type (Cash, Credit, etc.)
        paymentAmount:
          payments.paymentType === "credit" ? 0 : grandTotals.finalPrice, // Amount for non-credit payments
        remainingDues:
          payments.paymentType === "credit" ? grandTotals.finalPrice : 0, // Remaining dues for credit
        transactionId: payments.transactionId, // Transaction ID if applicable
      },
    };

    // console.log("Billing Data: ", billingData);
    onAddBilling(billingData);
    onClose();
  };

  const handleDeleteItem = (index) => {
    setAddedItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <div className="ipd-billing-modal-overlay">
      <div className="ipd-billing-modal-content">
        <button
          type="button"
          onClick={onClose}
          className="opd-closeBtn"
        >
          X
        </button>
        <h3 className="ipd-billing-title">Add Billing Items</h3>
        <form className="opd-billing-form">
          <div className="form-row fg-group">
            {/* Vendor Name Input */}
            <div className="form-group dropdown-container">
              <label>Vendor Name:</label>
              <input
                type="text"
                value={vendorSearch}
                onChange={handleVendorInputChange}
                placeholder="Search vendor..."
                autoComplete="off"
                disabled={addedItems.length > 0}
              />
              {/* Vendor Suggestions Dropdown */}
              {showVendorDropdown && vendors.length > 0 && (
                <ul className="store-dropdown">
                  {vendors.map((vendor) => (
                    <li
                      key={vendor._id}
                      onClick={() => handleSelectVendor(vendor)}
                    >
                      {vendor.companyName} ({vendor.contactNo1})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Purchase Number Field (Autofilled) */}
            <div className="form-group">
              <label>Purchase Number:</label>
              <input
                type="text"
                value={purchaseNumber}
                onChange={(e) => setPurchaseNumber(e.target.value)}
                disabled={addedItems.length > 0}
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group dropdown-container">
              <label>Item Name:</label>
              <input
                type="text"
                value={itemSearch}
                onChange={handleStoreInputChange}
                placeholder="Search store item..."
                autoComplete="off"
              />
              {showItemDropdown && itemOptions?.length > 0 && (
                <ul className="store-dropdown">
                  {itemOptions.map((item) => (
                    <li key={item._id} onClick={() => handleSelectItem(item)}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
          </div>
          <button
            type="button"
            className="opd-billing-add-item-btn"
            onClick={handleAddItem}
          >
            Add Item
          </button>
        </form>
        {addedItems.length > 0 && (
          <div>
            <table className="opd-billing-table">
              <thead>
                <tr>
                  {/* <th>Bill Type</th> */}
                  {/* <th>Item Date</th> */}
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Charge</th>
                  <th>Quantity</th>
                  <th>Discount</th>
                  <th>Discounted Price</th>
                  {/* <th>Discounted Price</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {addedItems.map((item, index) => (
                  <tr key={index}>
                    {/* <td>{item.itemType}</td> */}
                    {/* <td>{item.itemDate}</td> */}
                    <td>{item.name}</td>
                    <td>{item.categoryName}</td>
                    <td>{item.charge}</td>
                    <td>{item.quantity}</td>
                    <td>{item.discount}%</td>
                    <td>{item.finalPrice.toFixed(2)}</td>
                    {/* <td>{item.total}</td> */}
                    <td className="wing-btn">
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        onClick={() => handleDeleteItem(index)}
                        title="Delete"
                        className="icon"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="op-bill-container">
              {/* <p className="op-bill-column">Grand Totals:</p> */}
              <p className="op-bill-column">
                Total Price: ₹{grandTotals.totalCharge.toFixed(2)}
              </p>
              <p className="op-bill-column">
                Total Discount: ₹{grandTotals.totalDiscount.toFixed(2)}
              </p>
              <p className="op-bill-column">
                Final Price: ₹{grandTotals.finalPrice.toFixed(2)}
              </p>
            </div>
            {/* <div className="form-row fg-group" style={{ marginTop: "20px" }}>
              <div className="form-group">
                <label>Discount(₹):</label>
                <input
                  type="number"
                  name="finalDiscount"
                  onChange={(e) => {
                    console.log(e.target.value);
                    setGrandTotals((prev) => ({
                      ...prev,
                      finalDiscount: e.target.value,
                      finalPrice: (
                        parseFloat(grandTotals.totalDiscounted) -
                        parseFloat(e.target.value || 0)
                      )?.toFixed(2),
                    }));
                  }}
                  value={parseFloat(grandTotals.finalDiscount) || ""}
                />
              </div>

              <div className="form-group">
                <label>Total Payable Price(₹):</label>
                <input
                  type="text"
                  name="mw"
                  value={`${parseFloat(grandTotals.finalPrice) ?? ""}`}
                  readOnly
                />
              </div>
            </div> */}
          </div>
        )}

        <div className="form-row fg-group ipd-bill-m">
          <div className="form-group">
            <label>Payment Type</label>
            <select
              name="paymentType"
              value={payments?.paymentType}
              onChange={(e) => {
                setPayments((pre) => ({
                  ...pre,
                  paymentType: e.target.value,
                }));
              }}
              required
            >
              <option value="">Select Payment Type</option>
              <option value="cash">Cash</option>
              {/* <option value="credit">Credit</option> */}
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          {payments?.paymentType !== "credit" &&
            payments?.paymentType !== "cash" && (
              <div className="form-group">
                <label>Tansaction id (if applicable)</label>
                <input
                  name="transactionId"
                  value={payments?.transactionId}
                  onChange={(e) => {
                    setPayments((pre) => ({
                      ...pre,
                      transactionId: e.target.value,
                    }));
                  }}
                />
              </div>
            )}
          {payments?.paymentType !== "credit" && (
            <div className="form-group">
              <label>Enter Amount</label>
              <input
                type="number"
                name="paymentAmount"
                value={`${parseFloat(grandTotals.finalPrice).toFixed(2) ?? ""}`}
                required
                readOnly
                disabled
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddStoreBilling;

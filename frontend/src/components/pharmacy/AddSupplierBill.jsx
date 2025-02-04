import React, { useContext, useEffect, useState } from "react";
import "./styles/AddSupplier.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTrash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { getUserDetails } from "../../../utlis/userDetails";

const AddSupplierBill = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  isView = "create",
  isEdit,
}) => {
  const { setNotification } = useContext(AppContext);
  const [editRowIndex, setEditRowIndex] = useState(-1);
  const [formData, setFormData] = useState({
    supplierID: "",
    supplierName: "",
    supplierBillNumber: "",
    billDate: "",
    totalAmount: "",
    medicines: [
      {
        name: "",
        medicineId: "",
        quantity: 0,
        buyPrice: 0,
        sellPrice: 0,
        expiry: "",
        batchNumber: "",
        amount: 0,
      },
    ],
    payments: [
      {
        transactionType: "", // Credit or Debit
        transactionId: "", // Transaction ID
        amount: 0, // Payment amount
        paymentDate: "", // Payment date
        remainingDue: 0, // Remaining due after payment
      },
    ],
    payment: {
      transactionType: "", // Credit or Debit
      transactionId: "", // Transaction ID
      amount: 0, // Payment amount
      remainingDue: 0, // Remaining due after payment
    },
  });
  const [preloadData, setPreloadData] = useState({
    supplierList: [],
    medicineList: [],
  });

  useEffect(() => {
    if (medicine) {
      // console.log("Medicine:", medicine);
      setFormData((pre) => ({
        ...pre,
        ...medicine,
        payment: {
          ...pre.payment,
          remainingDue:
            medicine.payments[medicine.payments.length - 1].remainingDue,
        },
      }));
    }
    fetchMedicineList();
    fetchSupplierList();
  }, []);

  const removeDuplicates = (array) => {
    const seen = new Map();
    return array.filter((item) => {
      if (!seen.has(item.label)) {
        seen.set(item.label, true);
        return true;
      }
      return false;
    });
  };

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

  const fetchMedicineList = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/search-medicine`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        const medicineList = data.medicines.map((category) => {
          return {
            label: `${category.name}(${category.companyName})`,
            value: category._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          medicineList: removeDuplicates(medicineList),
        }));
      } else {
        setNotification("Failed to fetch company list");
      }
    } catch (error) {
      console.error("Error fetching company list:", error);
      setNotification("Server error");
    }
  };

  const handleAddMedicine = () => {
    setFormData((prevData) => ({
      ...prevData,
      medicines: [
        ...prevData.medicines,
        {
          name: "",
          quantity: 0,
          buyPrice: 0,
          sellPrice: 0,
          expiry: "",
          batchNumber: "",
          amount: 0,
        },
      ],
    }));
  };

  const handleMedicineChange = (index, field, value, label = null) => {
    setFormData((prevData) => {
      // Map through the medicines and update the changed medicine
      const updatedMedicines = prevData.medicines.map((medicine, i) =>
        i === index
          ? {
              ...medicine,
              [field]:
                value === ""
                  ? ""
                  : field === "quantity" || field === "buyPrice"
                  ? +value
                  : value,
              ...(label && { name: label }), // Add 'name' if label is provided
              // Recalculate the amount based on quantity and buyPrice
              amount:
                field === "quantity" || field === "buyPrice"
                  ? (field === "quantity" ? +value || 0 : medicine.quantity) *
                    (field === "buyPrice" ? +value || 0 : medicine.buyPrice)
                  : medicine.amount,
            }
          : medicine
      );

      // Calculate the updated totalAmount by summing all individual medicine amounts
      const updatedTotalAmount = updatedMedicines.reduce(
        (acc, medicine) => acc + (medicine.amount || 0),
        0
      );

      // Calculate the difference between the current and updated totalAmount
      const amountDifference = updatedTotalAmount - prevData.totalAmount;

      // Update the payments' remainingDue field based on the amountDifference
      const updatedPayments = prevData.payments.map((payment, idx) => ({
        ...payment,
        remainingDue: Math.max(
          (payment.remainingDue || 0) + amountDifference,
          0 // Ensure remaining due is never negative
        ),
      }));

      // Calculate the total payments already made
      const totalPayments = updatedPayments.reduce(
        (acc, payment) => acc + (parseFloat(payment.amount) || 0),
        0
      );

      // Calculate total due based on updated totalAmount and totalPayments
      const totalDue = updatedTotalAmount - totalPayments;

      // Return the updated form data
      return {
        ...prevData,
        medicines: updatedMedicines,
        payments: updatedPayments,
        totalAmount: updatedTotalAmount,
        payment: {
          ...prevData.payment,
          remainingDue: totalDue >= 0 ? totalDue : 0, // Ensure remaining due is never negative
        },
      };
    });
  };

  const handleEditRow = (index) => {
    setEditRowIndex(index); // Set the index of the row being edited
  };

  const handleSaveRow = (index) => {
    // Save logic (if needed) and set the row back to readonly
    setEditRowIndex(null);
  };

  const handlePaymentRowChange = (index, field, value) => {
    // console.log("DDD: ", value);
    const updatedPayments = [...formData.payments];

    if (field === "amount") {
      // Calculate the difference between the new and old amount
      const previousAmount = updatedPayments[index].amount || 0;
      const updatedAmount = parseFloat(value) || 0;
      const difference = updatedAmount - previousAmount;

      // Update the current payment's amount
      updatedPayments[index].amount = updatedAmount;

      // Update the remainingDue for the current and subsequent payments
      for (let i = index; i < updatedPayments.length; i++) {
        if (i === index) {
          updatedPayments[i].remainingDue =
            (updatedPayments[i].remainingDue || 0) - difference;
        } else {
          updatedPayments[i].remainingDue =
            (updatedPayments[i - 1].remainingDue || 0) -
            (updatedPayments[i].amount || 0);
        }
      }
    } else {
      // Update non-amount fields
      updatedPayments[index][field] = value;
    }

    setFormData({
      ...formData,
      payments: updatedPayments,
      payment: {
        ...formData.payment,
        remainingDue: updatedPayments[updatedPayments.length - 1].remainingDue,
      },
    });
  };

  const handleDeleteMedicine = (index) => {
    setFormData((prevData) => {
      const updatedMedicines = prevData.medicines.filter((_, i) => i !== index);
      const updatedTotalAmount = updatedMedicines.reduce(
        (acc, medicine) => acc + medicine.amount,
        0
      );

      return {
        ...prevData,
        medicines: updatedMedicines,
        totalAmount: updatedTotalAmount,
      };
    });
  };

  function removeFalsyValues(obj) {
    if (Array.isArray(obj)) {
      // Handle arrays: filter out falsy or empty objects
      return obj
        .map((item) => removeFalsyValues(item)) // Recursively clean each item
        .filter(
          (item) =>
            !(typeof item === "object" && Object.keys(item).length === 0) &&
            item
        ); // Remove empty objects and falsy items
    } else if (typeof obj === "object" && obj !== null) {
      // Handle objects: clean each key-value pair
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const cleanedValue = removeFalsyValues(value); // Recursively clean value
        if (
          !(
            typeof cleanedValue === "object" &&
            Object.keys(cleanedValue).length === 0
          ) && // Skip empty objects
          cleanedValue
        ) {
          acc[key] = cleanedValue; // Keep valid key-value pairs
        }
        return acc;
      }, {});
    } else {
      // For primitives, return as-is
      return obj;
    }
  }

  const handlePaymentChange = (field, value) => {
    setFormData((prevData) => {
      // Update the specific field in the payment object
      const updatedPayment = {
        ...prevData.payment,
        [field]: field === "amount" ? parseFloat(value) || 0 : value, // Parse amount if it's the amount field
      };

      // Recalculate total payments from paymentInfo array
      const totalPayments =
        prevData.payments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        ) + (updatedPayment.amount || 0);

      // Calculate the updated total due
      const totalDue = prevData.totalAmount - totalPayments;

      // Return the updated form data
      return {
        ...prevData,
        payment: {
          ...updatedPayment,
          remainingDue: totalDue >= 0 ? totalDue : 0, // Ensure remaining due is never negative
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateForm = { ...formData };
    // console.log("ee", editRowIndex);
    if (editRowIndex !== null && editRowIndex !== -1) {
      setNotification("Please save the edited row first");
      return;
    }
    try {
      if (onUpdate) {
        // console.log("Index:", editRowIndex);
        onUpdate(updateForm, editRowIndex);
        // console.log("Supplier Added:", updateForm);
        onClose();
      } else {
        delete updateForm.payments;
        // console.log("Supplier Added:", removeFalsyValues(updateForm));
        const userDetails = getUserDetails();
        const addedSupplier = { ...updateForm, ...userDetails };
        // console.log("updatedForm", addedSupplier);
        // console.log("full update");
        const res = await fetch(
          `${environment.url}/api/inventory/add-supplier-bill`,
          {
            method: "POST",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify(removeFalsyValues(addedSupplier)),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setNotification(data.message);
          setFormData({
            supplierID: "",
            supplierName: "",
            supplierBillNumber: "",
            billDate: "",
            totalAmount: "",
            medicines: [
              {
                name: "",
                medicineId: "",
                quantity: 0,
                buyPrice: 0,
                sellPrice: 0,
                expiry: "",
                batchNumber: "",
                amount: 0,
              },
            ],
            payments: [
              {
                transactionType: "", // Credit or Debit
                transactionId: "", // Transaction ID
                amount: 0, // Payment amount
                paymentDate: "", // Payment date
                remainingDue: 0, // Remaining due after payment
              },
            ],
            payment: {
              transactionType: "", // Credit or Debit
              transactionId: "", // Transaction ID
              amount: 0, // Payment amount
              remainingDue: 0, // Remaining due after payment
            },
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

  function formatDateToDDMMYYYY(dateString) {
    // Ensure the input is trimmed and correctly formatted
    if (typeof dateString !== "string" || !dateString.trim()) {
      throw new Error("Invalid date input: Must be a non-empty string");
    }
  
    const date = new Date(dateString);
  
    // Check if the created date is valid
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date: Unable to parse the input date string");
    }
  
    // Extract and format the day, month, and year
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
  
    return `${day}/${month}/${year}`;
  }

  return isView == "view" ? (
    <div className="view-bill-container">
      <h2>Bill Details</h2>
      <div>
        {/* Supplier and Bill Details */}
        <div
          className="form-row"
          style={{marginBottom: "-30px"}}
        >
          <div className="form-group" style={{display: "flex", flexDirection: "row"}}>
            <label>Supplier:</label>
            <span>{formData.supplierName || "N/A"}</span>
          </div>
          <div className="form-group" style={{display: "flex", flexDirection: "row"}}>
            <label>Supplier Bill Number:</label>
            <span>{formData.supplierBillNumber || "N/A"}</span>
          </div>
          <div className="form-group" style={{display: "flex", flexDirection: "row"}}>
            <label>Bill Date:</label>
            <span>{formData?.billDate.split("T")[0] || "N/A"}</span>
          </div>
        </div>

        {/* Medicines Section */}
        <div className="medicines-container">
          <h3>Medicines</h3>
          <table className="medicines-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Expiry</th>
                <th>Batch Number</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {formData.medicines.map((medicine, index) => (
                <tr key={index}>
                  <td>{medicine.name || "N/A"}</td>
                  <td>{medicine.quantity || "N/A"}</td>
                  <td>{medicine.buyPrice || "N/A"}</td>
                  <td>{medicine.sellPrice || "N/A"}</td>
                  <td>{medicine.expiry || "N/A"}</td>
                  <td>{medicine.batchNumber || "N/A"}</td>
                  <td>{medicine.amount || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Amount */}
        <div
          className="form-row"
          style={{ display: "flex", justifyContent: "normal" }}
        >
          <label>Total Amount: </label>
          <span> &#8377;{formData.totalAmount || "N/A"}</span>
        </div>
      </div>
      <form className="bill-form" onSubmit={handleSubmit}>
        <div className="section">
          <h3 className="section-title">Payments</h3>

          {/* Existing Payments (Editable Rows) */}
          <div className="payment-info">
            <table className="payment-info-table">
              <thead>
                <tr>
                  <th>Transaction Type</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Remaining Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.payments.map((payment, index) => (
                  <tr key={index}>
                    <td>
                      {editRowIndex === index ? (
                        <select
                          value={payment.transactionType}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "transactionType",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Type</option>
                          <option value="credit">Credit</option>
                          <option value="debit">Debit</option>
                          <option value="cash">Cash</option>
                          <option value="online">Online</option>
                        </select>
                      ) : (
                        payment.transactionType || "N/A"
                      )}
                    </td>
                    <td>
                      {editRowIndex === index ? (
                        <input
                          type="text"
                          value={payment.transactionId}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "transactionId",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        payment.transactionId || "N/A"
                      )}
                    </td>
                    <td>
                      {editRowIndex === index ? (
                        <input
                          type="number"
                          value={payment.amount}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "amount",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        payment.amount || "0"
                      )}
                    </td>
                    <td>
                      {editRowIndex === index ? (
                        <input
                          type="date"
                          value={payment.paymentDate}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "paymentDate",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        // change to local date format like dd/mm/yyyy
                        // new Date(payment.date).toLocaleDateString() || "N/A"
                        payment.date || "N/A"
                      )}
                    </td>
                    <td>{payment.remainingDue || "N/A"}</td>
                    <td>
                      {!isView && (
                        <>
                          {editRowIndex === index ? (
                            <button
                              type="button"
                              onClick={() => handleSaveRow(index)}
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEditRow(index)}
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Payment */}
          {!isView && (
            <div className="payment-row">
              <label>
                Transaction Type:
                <select
                  value={formData.payment.transactionType}
                  onChange={(e) =>
                    handlePaymentChange("transactionType", e.target.value)
                  }
                >
                  <option value="">Select Type</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
              </label>
              <label>
                Transaction ID:
                <input
                  type="text"
                  value={formData.payment.transactionId}
                  onChange={(e) =>
                    handlePaymentChange("transactionId", e.target.value)
                  }
                  placeholder="Transaction ID"
                />
              </label>
              <label>
                Amount:
                <input
                  type="number"
                  value={formData.payment.amount || ""}
                  onChange={(e) =>
                    handlePaymentChange("amount", e.target.value)
                  }
                  placeholder="Amount"
                />
              </label>
              <label>
                Total Due:
                <input
                  type="number"
                  value={formData.payment.remainingDue}
                  readOnly
                  placeholder="Total Due"
                />
              </label>
            </div>
          )}
        </div>

        {!isView && (
          <button type="submit" className="submit-btn">
            Submit Bill
          </button>
        )}
      </form>
    </div>
  ) : (
    <div className="supplier-popup-content">
      <h2 className="title">{!isEdit ? "Add New Bill" : "Update Bill"}</h2>
      <form className="bill-form" onSubmit={handleSubmit}>
        {/* Supplier and Bill Details */}
        <div className="section">
          <h3 className="section-title">Supplier and Bill Details</h3>
          <div className="form-row">
            <label className="form-label" style={{ gap: "5px" }}>
              Supplier:
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue) =>
                  Promise.resolve(
                    preloadData.supplierList.filter((supplier) =>
                      supplier.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                  )
                }
                defaultOptions={preloadData.supplierList}
                value={preloadData.supplierList.find(
                  (supplier) => supplier.value === formData.supplierID
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplierID: e?.value || "",
                    supplierName: e?.label || "",
                  })
                }
                placeholder="Select Supplier"
                isClearable
                required
              />
            </label>
            <label className="form-label">
              Supplier Bill Number:
              <input
                type="text"
                name="supplierBillNumber"
                value={formData.supplierBillNumber}
                onChange={handleChange}
                placeholder="Supplier Bill Number"
                required
              />
            </label>
            <label className="form-label">
              Bill Date:
              <input
                type="date"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </div>

        {/* Medicines Section */}
        <div className="section">
          <h3 className="section-title">Medicines</h3>
          <table className="medicines-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Expiry</th>
                <th>Batch Number</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.medicines.map((medicine, index) => (
                <tr key={index}>
                  <td style={{ width: "200px" }}>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={(inputValue) =>
                        Promise.resolve(
                          preloadData.medicineList.filter((supplier) =>
                            supplier.label
                              .toLowerCase()
                              .includes(inputValue.toLowerCase())
                          )
                        )
                      }
                      defaultOptions={preloadData.medicineList}
                      value={preloadData.medicineList.find(
                        (medicine) =>
                          medicine.value ===
                          formData.medicines[index].medicineId
                      )}
                      onChange={(e) => {
                        if (e) {
                          handleMedicineChange(
                            index,
                            "medicineId",
                            e.value,
                            e.label
                          );
                        } else {
                          handleMedicineChange(index, "medicineId", null, null);
                        }
                      }}
                      placeholder="Medicine Name"
                      isClearable
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={medicine.quantity || ""}
                      onChange={(e) =>
                        handleMedicineChange(index, "quantity", e.target.value)
                      }
                      placeholder="Quantity"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={medicine.buyPrice || ""}
                      onChange={(e) =>
                        handleMedicineChange(index, "buyPrice", e.target.value)
                      }
                      placeholder="Buy Price"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={medicine.sellPrice || ""}
                      onChange={(e) =>
                        handleMedicineChange(index, "sellPrice", e.target.value)
                      }
                      placeholder="Sell Price"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={medicine.expiry}
                      onChange={(e) =>
                        handleMedicineChange(index, "expiry", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={medicine.batchNumber}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "batchNumber",
                          e.target.value
                        )
                      }
                      placeholder="Batch Number"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={medicine.amount}
                      readOnly
                      placeholder="Amount"
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      title="Delete"
                      className="consumable-icon"
                      onClick={() => handleDeleteMedicine(index)}
                      style={{ fontSize: "20px" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="add-btn"
            onClick={handleAddMedicine}
            style={{ backgroundColor: "var(--secondBase)", fontWeight: "500" }}
          >
            +
          </button>
        </div>

        {/* Total Amount */}
        <div
          className="form-row total-amount-row"
          style={{ width: "fit-content" }}
        >
          <label className="form-label">
            Total Amount:
            <input
              type="number"
              value={formData.totalAmount}
              readOnly
              placeholder="Total Amount"
            />
          </label>
        </div>

        {/* Payments Section */}
        <div className="section">
          <h3 className="section-title">Payments</h3>

          {/* Existing Payments (Editable Rows) */}
          <div className="payment-info">
            <table className="payment-info-table">
              <thead>
                <tr>
                  <th>Transaction Type</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Remaining Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.payments.map((payment, index) => (
                  <tr key={index}>
                    <td>
                      {editRowIndex === index ? (
                        <select
                          value={payment.transactionType}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "transactionType",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Type</option>
                          <option value="credit">Credit</option>
                          <option value="debit">Debit</option>
                          <option value="cash">Cash</option>
                          <option value="online">Online</option>
                        </select>
                      ) : (
                        payment.transactionType || "N/A"
                      )}
                    </td>
                    <td>
                      {editRowIndex === index ? (
                        <input
                          type="text"
                          value={payment.transactionId}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "transactionId",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        payment.transactionId || "N/A"
                      )}
                    </td>
                    <td>
                      {editRowIndex === index ? (
                        <input
                          type="number"
                          value={payment.amount}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "amount",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        payment.amount || "0"
                      )}
                    </td>
                    <td>
                      {editRowIndex === index ? (
                        <input
                          type="date"
                          value={payment.paymentDate}
                          onChange={(e) =>
                            handlePaymentRowChange(
                              index,
                              "paymentDate",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        // change to local date format like dd/mm/yyyy
                        // new Date(payment.date).toLocaleDateString() || "N/A"
                        payment.paymentDate || "N/A"
                      )}
                    </td>
                    <td>{payment.remainingDue || "N/A"}</td>
                    <td style={{ textAlign: "center" }}>
                      {(isView === "view" || isView === "edit") &&
                        (editRowIndex === index ? (
                          <FontAwesomeIcon
                            icon={faSave}
                            title="Save"
                            className="consumable-icon"
                            onClick={() => handleSaveRow(index)}
                            style={{ fontSize: "20px" }}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faEdit}
                            title="Edit"
                            className="consumable-icon"
                            onClick={() => handleEditRow(index)}
                            style={{ fontSize: "20px" }}
                          />
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Payment */}
          <div className="payment-row">
            <label>
              Transaction Type:
              <select
                value={formData.payment.transactionType}
                onChange={(e) =>
                  handlePaymentChange("transactionType", e.target.value)
                }
                style={{ padding: "6px" }}
              >
                <option value="">Select Type</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </label>
            <label>
              Transaction ID:
              <input
                type="text"
                value={formData.payment.transactionId}
                onChange={(e) =>
                  handlePaymentChange("transactionId", e.target.value)
                }
                placeholder="Transaction ID"
              />
            </label>
            <label>
              Amount:
              <input
                type="number"
                value={formData.payment.amount || ""}
                onChange={(e) => handlePaymentChange("amount", e.target.value)}
                placeholder="Amount"
              />
            </label>
            <label>
              Total Due:
              <input
                type="number"
                value={formData.payment.remainingDue || ""}
                readOnly
                placeholder="Total Due"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          style={{ margin: "0", backgroundColor: "var(--secondBase" }}
        >
          Submit Bill
        </button>
      </form>
    </div>
  );
};

export default AddSupplierBill;

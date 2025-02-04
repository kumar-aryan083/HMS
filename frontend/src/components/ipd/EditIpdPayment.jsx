import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { environment } from "../../../utlis/environment.js";
import "./styles/EditIpdBilling.css";
import SearchableDropdown from "./SearchableDropdown.jsx";

const EditIpdPayment = ({
  isOpen,
  onClose,
  onUpdateBilling,
  billingDetails,
  admissionId,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    itemType: "",
    itemName: "",
    charge: "",
    quantity: "",
    totalCharge: "",
    total: "",
    discount: 0,
    railwayCode: "",
    paymentType: "",
    paymentAmount: "",
    remainingDues: "",
    transactionId: "",
    date: "",
  });

  const [transactions, setTransactions] = useState(
    billingDetails?.transactionHistory
  );
  const [newTransaction, setNewTransaction] = useState({
    paymentType: "",
    transactionId: "",
    paymentAmount: "",
    date: "",
    remainingDues: (
      (billingDetails?.grandTotals?.finalPrice || 0) -
      (billingDetails?.transactionHistory?.reduce(
        (acc, amt) => acc + (amt.paymentAmount || 0),
        0
      ) || 0)
    )?.toFixed(2),
  });

  const [items, setItems] = useState(billingDetails.item);
  const [itemOptions, setItemOptions] = useState([]);
  const [showRailwayCode, setShowRailwayCode] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(-1);
  const [patientType, setPatientType] = useState(null);
  const [grandTotals, setGrandTotals] = useState(
    Object.keys(billingDetails?.grandTotals).reduce((acc, key) => {
      acc[key] = billingDetails?.grandTotals[key].toString();
      return acc;
    }, {})
  );

  useEffect(() => {
    fetchPatientDetails();
  }, []);

  const calculateGrandTotals = (items) => {
    const totalCharge = items.reduce(
      (acc, item) => acc + parseFloat(item.total),
      0
    );

    const discount = items.reduce(
      (acc, item) => acc + (parseFloat(item.total) * item.discount) / 100,
      0
    );
    const totalDiscounted = totalCharge - discount;
    return {
      totalCharge: totalCharge.toFixed(2),
      totalDiscounted: totalDiscounted.toFixed(2),
      totalDiscount: discount.toFixed(2),
      finalPrice: (grandTotals?.finalDiscount
        ? totalDiscounted - parseFloat(grandTotals?.finalDiscount)
        : totalDiscounted
      ).toFixed(2),
    };
  };

  const handleDeleteItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setGrandTotals((pre) => ({ ...pre, ...calculateGrandTotals(items) }));
  }, [items]);

  useEffect(() => {
    const { paymentAmount } = form;
    const { totalDiscounted } = grandTotals;
    const remainingDues =
      totalDiscounted && paymentAmount
        ? totalDiscounted - paymentAmount
        : totalDiscounted;

    setForm((prevForm) => ({
      ...prevForm,
      remainingDues: Number(remainingDues).toFixed(2),
    }));
  }, [form.paymentAmount, form.total, grandTotals]);

  useEffect(() => {
    const { charge, quantity, discount } = form;
    const totalCharge = charge && quantity ? charge * quantity : 0;
    const total =
      totalCharge && discount
        ? totalCharge - (totalCharge * discount) / 100
        : totalCharge;

    setForm((prevForm) => ({
      ...prevForm,
      totalCharge: totalCharge.toFixed(2),
      total: Number(total).toFixed(2),
    }));
  }, [form.charge, form.quantity]);

  const handleEditRow = (index) => {
    setEditRowIndex(index); // Set the index of the row being edited
  };

  const handleSaveRow = (index) => {
    // Save logic (if needed) and set the row back to readonly
    setEditRowIndex(null);
  };

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/ipd/${admissionId}/get-admission-details`,
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
        // console.log("Patient details:", data);
        setPatientType(data.patientId?.railwayType);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedBilling = {
      ...billingDetails,
      transactionHistory: [
        ...transactions,
        {
          paymentType: newTransaction.paymentType,
          transactionId: newTransaction.transactionId,
          paymentAmount: newTransaction.paymentAmount,
          date: newTransaction.date,
          remainingDues: newTransaction.remainingDues,
        },
      ],
    };
    onUpdateBilling(updatedBilling);
    onClose();
  };

  const handlePaymentRowChange = (index, field, value) => {
    const updatedPayments = [...billingDetails.transactionHistory];

    if (field === "paymentAmount") {
      // Calculate the difference between the new and old amount
      const previousAmount = updatedPayments[index].paymentAmount || 0;
      const updatedAmount = parseFloat(value) || 0;
      const difference = updatedAmount - previousAmount;

      // Update the current payment's amount
      updatedPayments[index].paymentAmount = updatedAmount;

      // Update the remainingDue for the current and subsequent payments
      for (let i = index; i < updatedPayments.length; i++) {
        if (i === index) {
          updatedPayments[i].remainingDues =
            (updatedPayments[i].remainingDues || 0) - difference;
        } else {
          updatedPayments[i].remainingDues =
            (updatedPayments[i - 1].remainingDues || 0) -
            (updatedPayments[i].paymentAmount || 0);
        }
      }
    } else {
      // Update non-amount fields
      updatedPayments[index][field] = value;
    }

    setTransactions(updatedPayments);
    setNewTransaction((pre) => ({
      ...pre,
      remainingDues: updatedPayments[updatedPayments.length - 1].remainingDues,
    }));
  };

  // if (!isOpen || !bill || !bill.item) return null;

  return (
    <div className="edit-billing-modal-overlay">
      <div className="edit-billing-modal-content">
        <button onClick={onClose} className="closeBtn">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h3>Edit Payment Ledger</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row fg-group">
            <div className="form-group op-bill-heading">
              <label>Bill Number:</label>
              <input type="text" value={billingDetails.billNumber} disabled />
            </div>
          </div>
          {/* 
          <h4>Items</h4> */}
          {/* {bill.item.map((item, index) => (
            <div className="form-row fg-group" key={index}>
              <div className="form-group">
                <label>Item Type:</label>
                <select
                  value={item.itemType || ""}
                  onChange={(e) => handleItemChange(e, index, "itemType")}
                >
                  <option value="">Select Type</option>
                  <option value="opdConsultation">Opd Consultation</option>
                  <option value="ipdRate">Ipd Rate</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="labTest">Laboratory</option>
                  <option value="package">Packages</option>
                  <option value="service">Services</option>
                  <option value="nursing">Nursing</option>
                  <option value="visitingDoctor">Visiting Doctor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Item Name:</label>
                <select
                  value={item.itemName || ""}
                  onChange={(e) => handleItemChange(e, index, "itemName")}
                >
                  <option value="">Select Item</option>
                  {(item.options || []).map((option, i) => (
                    <option key={i} value={option.itemName}>
                      {option.itemName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  value={item.charge || ""}
                  onChange={(e) => handleItemChange(e, index, "charge")}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) => handleItemChange(e, index, "quantity")}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Price:</label>
                <input type="number" value={item.totalCharge || ""} readOnly />
              </div>
            </div>
          ))} */}

          <div className="op-bill-container">
            {/* <p className="op-bill-column">Grand Totals:</p> */}
            <p className="op-bill-column">
              Total Price: ₹{grandTotals.totalCharge}
            </p>
            <p className="op-bill-column">
              Total Discount: ₹{grandTotals.totalDiscount}
            </p>
            <p className="op-bill-column">
              Discounted Price: ₹{grandTotals.totalDiscounted}
            </p>
            <p className="op-bill-column">
              Final Discount: ₹{grandTotals?.finalDiscount}
            </p>
            <p className="op-bill-column">
              Final Price: ₹{grandTotals?.finalPrice}
            </p>
          </div>

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
                  {billingDetails?.transactionHistory?.map((payment, index) => (
                    <tr key={index}>
                      <td>
                        {editRowIndex === index ? (
                          <select
                            value={payment.paymentType || "N/A"}
                            onChange={(e) =>
                              handlePaymentRowChange(
                                index,
                                "paymentType",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Type</option>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                          </select>
                        ) : (
                          parseFloat(payment.paymentType) || "N/A"
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
                            value={payment.paymentAmount || ""}
                            onChange={(e) =>
                              handlePaymentRowChange(
                                index,
                                "paymentAmount",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          payment.paymentAmount || "0"
                        )}
                      </td>
                      <td>
                        {editRowIndex === index ? (
                          <input
                            type="date"
                            value={payment.date}
                            onChange={(e) =>
                              handlePaymentRowChange(
                                index,
                                "date",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          // change to local date format like dd/mm/yyyy
                          // new Date(payment.date).toLocaleDateString() || "N/A"
                          new Date(payment.date)?.toLocaleDateString() || "N/A"
                        )}
                      </td>
                      <td>{parseFloat(payment.remainingDues) || "N/A"}</td>
                      <td>
                        {true &&
                          (editRowIndex === index ? (
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
                  value={newTransaction?.paymentType || ""}
                  onChange={(e) =>
                    setNewTransaction((pre) => ({
                      ...pre,
                      paymentType: e.target.value,
                      date: new Date().toISOString(),
                    }))
                  }
                >
                  <option value="">Select Type</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                </select>
              </label>
              <label>
                Transaction ID:
                <input
                  type="text"
                  value={newTransaction.transactionId}
                  onChange={(e) =>
                    setNewTransaction((pre) => ({
                      ...pre,
                      transactionId: e.target.value,
                    }))
                  }
                  placeholder="Transaction ID"
                />
              </label>
              <label>
                Amount:
                <input
                  type="number"
                  value={newTransaction.paymentAmount || ""}
                  onChange={(e) =>
                    setNewTransaction((pre) => ({
                      ...pre,
                      paymentAmount: e.target.value,
                      remainingDues: (
                        grandTotals?.finalPrice -
                        (transactions?.reduce(
                          (acc, amt) => acc + (amt.paymentAmount || 0),
                          0
                        ) || 0) -
                        e.target.value
                      ).toFixed(2),
                    }))
                  }
                  placeholder="Amount"
                />
              </label>
              <label>
                Total Due:
                <input
                  type="number"
                  value={newTransaction.remainingDues || ""}
                  readOnly
                  placeholder="Total Due"
                />
              </label>
            </div>
          </div>

          {/* Payment Section
          <h4>Payment</h4>
          <div className="form-row fg-group ipd-bill-m">
            <div className="form-group">
              <label>Payment Type</label>
              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handlePaymentChange}
              >
                <option value="">Select Payment Type</option>
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className="form-group">
              <label>Transaction ID (if applicable)</label>
              <input
                name="transactionId"
                value={form.transactionId}
                onChange={handlePaymentChange}
              />
            </div>

            <div className="form-group">
              <label>Payment Amount</label>
              <input
                type="number"
                name="paymentAmount"
                value={form.paymentAmount}
                onChange={handlePaymentChange}
              />
            </div>

            <div className="form-group">
              <label>Remaining Dues</label>
              <input
                type="number"
                name="remainingDues"
                value={form.remainingDues}
                readOnly
              />
            </div>
          </div> */}
          <button type="submit">
            <FontAwesomeIcon icon={faSave} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditIpdPayment;

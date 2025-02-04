import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { environment } from "../../../utlis/environment.js";
import SearchableDropdown from "../ipd/SearchableDropdown.jsx";

const EditOpdBilling = ({
  isOpen,
  onClose,
  onUpdateBilling,
  billingDetails,
  opdId,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    itemType: billingDetails?.item[0]?.itemType,
    itemName: "",
    charge: "",
    quantity: 1,
    totalCharge: "",
    total: "",
    discount: 0,
    railwayCode: "",
    paymentType: "",
    paymentAmount: "",
    remainingDues: "",
    transactionId: "",
    date: "",
    itemDate: "",
    itemCategory: "",
  });
  const [items, setItems] = useState(billingDetails.item);
  const [itemOptions, setItemOptions] = useState([]);
  const [showRailwayCode, setShowRailwayCode] = useState(false);
    const [railwayType, setRailwayType] = useState(null);
    const [patientType, setPatientType] = useState(null);
  const [grandTotals, setGrandTotals] = useState(
    Object.keys(billingDetails?.grandTotals).reduce((acc, key) => {
      acc[key] = billingDetails?.grandTotals[key].toString();
      return acc;
    }, {})
  );
  const [payments, setPayments] = useState({
    paymentType: "",
    transactionId: "",
    paymentAmount: "",
  });
  const [loading, setLoading] = useState(false);
    const [staffs, setStaffs] = useState([]);
    const [discountBy, setDiscountBy] = useState("");
    const [discountById, setDiscountById] = useState("");
  // const [date, setDate] = useState(billingDetails?.date || "");

  useEffect(() => {
    fetchPatientDetails();
    fetchStaff();
  }, []);
  const fetchStaff = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${environment.url}/api/common/get-staff-list`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });
        const data = await res.json();
        if (res.ok) {
          // console.log("All staffs: ", data);
          setStaffs(data.totalItems);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    // const handleSelection = (e) => {
    //   const selectedStaff = staffs.find((staff) => staff._id === e.target.value);
    //   setDiscountBy(selectedStaff.name);
    //   setDiscountById(selectedStaff._id);
    // };

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/opd/${opdId}/get-patient-opdId`,
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
        setRailwayType(data.patient?.railwayType);
        setPatientType(data.patient?.patientType?.name);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  // const [itemOptions, setItemOptions] = useState([]);
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
      finalPrice: grandTotals?.finalDiscount
        ? totalDiscounted - parseFloat(grandTotals?.finalDiscount)
        : totalDiscounted.toFixed(2),
    };
  };

  // const [transactionHistory, setTransactionHistory] = useState(
  //   billingDetails?.transactionHistory || []
  // );
  // const [globalDiscount, setGlobalDiscount] = useState(0);

  // useEffect(() => {
  //   if (billingDetails) {
  //     setBill({
  //       ...billingDetails,
  //       item: billingDetails.item || [],
  //     });
  //     setTransactionHistory(billingDetails.transactionHistory || []);
  //     setDate(billingDetails.date || "");
  //     setGlobalDiscount(billingDetails.globalDiscount || 0);
  //     calculateGrandTotals(billingDetails.item || []);
  //   }
  // }, [billingDetails]);

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

  const fetchItems = async (itemType, index) => {
    try {
      if (itemType) {
        const response = await fetch(
          `${environment.url}/api/opd/get-opd-items?itemType=${itemType}&opdId=${opdId}`
        );
        if (response.ok) {
          const data = await response.json();
          const updatedItems = [...bill.item];
          updatedItems[index].options = data.prices || [];
          setBill({ ...bill, item: updatedItems });
        } else {
          console.error("Failed to fetch items");
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };

      // Update remaining dues when payment amount changes
      if (name === "paymentAmount") {
        const paymentAmount = parseFloat(value) || 0;
        const remainingDues = parseFloat(updatedForm.total) - paymentAmount;
        updatedForm.remainingDues = remainingDues.toFixed(2);
      }

      if (name === "discount") {
        // console.log("Discount changed");
        const totalCharge = parseFloat(form.charge) * parseFloat(form.quantity);
        // console.log(totalCharge);
        const total = totalCharge - (totalCharge * value) / 100;
        updatedForm.totalCharge = total.toFixed(2);
      }

      return updatedForm;
    });

    if (name === "itemType") {
      // fetchItems(value);
    } else if (name === "itemName") {
      // Get selected item's details and update form
      if (form.itemType === "pharmacy") {
        const selectedItem = itemOptions.find((item) => item._id === value);
        if (selectedItem) {
          setForm((prevForm) => ({
            ...prevForm,
            itemName: `${selectedItem.name}(${selectedItem.companyName}/${selectedItem.expiryDate})`,
            itemId: selectedItem._id,
            charge: selectedItem.pricePerUnit, // Update price with the selected item's price
          }));
        }
      } else {
        const selectedItem = itemOptions.find(
          (item) => item.itemName === value
        );
        if (selectedItem) {
          setForm((prevForm) => ({
            ...prevForm,
            itemName: selectedItem.itemName,
            charge: selectedItem.price, // Update price with the selected item's price
            railwayCode: selectedItem.railwayCode || "",
          }));
          setShowRailwayCode(!!selectedItem.railwayCode);
        }
      }
    }
  };

  // const handlePaymentChange = (e) => {
  //   const { name, value } = e.target;
  //   let updatedForm = { ...form, [name]: value };

  //   if (name === "paymentAmount") {
  //     const paymentAmount = parseFloat(value) || 0;
  //     const remainingDues = Math.max(
  //       grandTotals.totalDiscounted - paymentAmount,
  //       0
  //     );
  //     updatedForm.remainingDues = remainingDues;
  //   }

  //   setForm(updatedForm);
  // };

  // const handleDateChange = (e) => {
  //   setDate(e.target.value);
  // };

  // const handleGlobalDiscountChange = (e) => {
  //   const discount = parseFloat(e.target.value) || 0;
  //   setGlobalDiscount(discount);
  //   calculateGrandTotals(bill.item, discount);
  // };

  // const calculateGrandTotals = (items, discount) => {
  //   const totalCharge = items.reduce(
  //     (sum, item) => sum + (parseFloat(item.totalCharge) || 0),
  //     0
  //   );
  //   const totalDiscount = (totalCharge * discount) / 100;
  //   const totalDiscounted = totalCharge - totalDiscount;

  //   const newGrandTotals = {
  //     totalCharge: totalCharge.toFixed(2),
  //     totalDiscount: totalDiscount.toFixed(2),
  //     totalDiscounted: totalDiscounted.toFixed(2),
  //   };

  //   setGrandTotals(newGrandTotals);

  //   setBill((prevBill) => ({
  //     ...prevBill,
  //     grandTotals: newGrandTotals,
  //     globalDiscount: discount,
  //   }));
  // };

  // const handleTransactionChange = (index, field, value) => {
  //   const updatedTransactions = [...transactionHistory];
  //   updatedTransactions[index][field] = value;

  //   const totalPaid = updatedTransactions.reduce(
  //     (sum, tx) => sum + parseFloat(tx.paymentAmount || 0),
  //     0
  //   );

  //   const remainingDues = grandTotals.totalDiscounted - totalPaid;

  //   // Update the remainingDues for the current transaction
  //   updatedTransactions[index].remainingDues = remainingDues;

  //   setTransactionHistory(updatedTransactions);
  //   setBill((prevBill) => ({
  //     ...prevBill,
  //     transactionHistory: updatedTransactions,
  //   }));
  // };

  const handleAddItem = (e) => {
    e.preventDefault();
    // console.log(form);
    if (
      form.itemName &&
      form.charge &&
      form.total !== ""
    ) {
      setItems((prevItems) => [...prevItems, form]);
      setForm((prevForm) => ({
        ...prevForm,
        itemName: "",
        charge: "",
        quantity: "",
        totalCharge: "",
        total: "",
        paymentType: "",
        paymentAmount: "",
        remainingDues: "",
        transactionId: "",
        discount: 0,
        itemId: undefined,
        date: prevForm.date,
        itemDate: prevForm.itemDate,
      }));
      setShowRailwayCode(false);
    } else {
      alert("Please fill all fields before adding an item.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedBilling = {
      ...billingDetails,
      item: items,
      grandTotals: grandTotals,
      paymentInfo: {
        paymentType: payments?.paymentType,
        paymentAmount: !items?.some(
          (i) =>
            i.itemType === "ipd" || i.itemType === "opd" || i.itemType === "all"
        )
          ? grandTotals?.finalPrice
          : 0,
        remainingDues: items?.some(
          (i) =>
            i.itemType === "ipd" || i.itemType === "opd" || i.itemType === "all"
        )
          ? grandTotals?.finalPrice
          : 0,
        transactionId: payments?.transactionId,
      },
      finalDiscountBy: discountBy,
      // finalDiscountById: discountById,
    };
    onUpdateBilling(updatedBilling);
    onClose();
  };

  // if (!isOpen || !bill || !bill.item) return null;

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
        <h3 className="ipd-billing-title">Update Billing Items</h3>
        <form className="opd-billing-form">
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                onChange={handleChange}
                value={form.date}
                disabled={items.length > 0}
              />
            </div>
            <div className="form-group">
              <label>Bill Type</label>
              <input type="text" value={"OPD"} readOnly />
            </div>
            {/* <div className="form-group">
              <label>Bill Type</label>
              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                disabled={items.length > 0}
              >
                <option value="">Select Category</option>
                <option value="all">All Categories</option>
                <option value="ipd">IPD</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="labTest">Laboratory</option>
              </select>
            </div> */}
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Item Date</label>
              <input
                type="date"
                name="itemDate"
                value={form.itemDate}
                onChange={handleChange}
                disabled={items.length > 0}
              />
            </div>
            <div className="form-group">
              <label>Item Name:</label>
              <SearchableDropdown
                billType={"ipd"}
                setForm={setForm}
                form={form}
                setShowRailwayCode={setShowRailwayCode}
                patientType={patientType}
                railwayType={railwayType}
                items={items}
              />
            </div>

            {showRailwayCode && (
              <div className="form-group">
                <label>Railway Code:</label>
                <input
                  type="text"
                  name="railwayCode"
                  value={form.railwayCode}
                  readOnly
                />
              </div>
            )}

            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                name="charge"
                onChange={handleChange}
                value={form.charge}
                // disabled={items.length > 0}
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                onChange={handleChange}
                value={form.quantity}
                disabled={items.length > 0}
              />
            </div>
            <div className="form-group">
              <label>Discount(%):</label>
              <input
                type="number"
                name="discount"
                onChange={handleChange}
                value={form.discount || ""}
                disabled={items.length > 0}
              />
            </div>
            <div className="form-group">
              <label>Total Price:</label>
              <input
                type="number"
                name="totalCharge"
                onChange={handleChange}
                value={form.totalCharge}
                disabled={items.length > 0}
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
        {items.length > 0 && (
          <div>
            <table className="opd-billing-table">
              <thead>
                <tr>
                  <th>Bill Type</th>
                  <th>Item Date</th>
                  <th>Item Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Discount</th>
                  <th>Discounted Price</th>
                  {/* <th>Discounted Price</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>OPD</td>
                    <td>{new Date(item.itemDate).toLocaleDateString()}</td>
                    <td>{item.itemName}</td>
                    <td>{item.charge}</td>
                    <td>{item.quantity}</td>
                    <td>{item.total}</td>
                    <td>{item.discount}%</td>
                    <td>{item.totalCharge}</td>
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
                Total Price: ₹{grandTotals.totalCharge}
              </p>
              <p className="op-bill-column">
                Total Discount: ₹{grandTotals.totalDiscount}
              </p>
              <p className="op-bill-column">
                Final Price: ₹{grandTotals.totalDiscounted}
              </p>
            </div>
            <div className="form-row fg-group" style={{ marginTop: "20px" }}>
              <div className="form-group">
                <label>Discount(₹):</label>
                <input
                  type="number"
                  name="finalDiscount"
                  onChange={(e) => {
                    // console.log(e.target.value);
                    setGrandTotals((prev) => ({
                      ...prev,
                      finalDiscount: e.target.value,
                      finalPrice: (
                        parseFloat(grandTotals.totalDiscounted) -
                        (parseFloat(e.target.value) || 0)
                      )?.toFixed(2),
                    }));
                  }}
                  value={parseFloat(grandTotals.finalDiscount) || ""}
                />
              </div>
              <div className="form-group">
                <label>Discount By:</label>
                <input
                  type="text"
                  name="discountBy"
                  onChange={(e)=> setDiscountBy(e.target.value)}
                  value={discountBy}
                />
              </div>
              {/* <div className="form-group">
                <label>Discount By</label>
                <select
                  id="staff-dropdown"
                  value={discountById}
                  onChange={handleSelection}
                >
                  <option value="" disabled>
                    -- Select Staff --
                  </option>
                  {staffs.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div> */}
              {/* <div className="form-group"> */}
              <div className="form-group">
                <label>Total Payable Price(₹):</label>
                <input
                  type="text"
                  name="mw"
                  value={`${parseFloat(grandTotals.finalPrice) ?? ""}`}
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Section */}
        {items?.some(
          (i) =>
            i.itemType !== "ipd" && i.itemType !== "opd" && i.itemType !== "all"
        ) && (
          <>
            <div className="form-row fg-group ipd-bill-m">
              {/* <div className="form-group">
            <label>Discount (in %):</label>
            <input
              type="number"
              name="discount"
              onChange={handleDiscountChange}
              value={discount}
              
            />
          </div> */}
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
                >
                  <option value="">Select Payment Type</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              {form.paymentType !== "credit" && (
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
            </div>
            <div className="form-row fg-group">
              {form.paymentType !== "credit" && (
                <div className="form-group">
                  <label>Enter Amount</label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={`${parseFloat(grandTotals.finalPrice) ?? ""}`}
                    readOnly
                    disabled
                  />
                </div>
              )}
              {/* {form.paymentType !== "credit" && (
            <div className="form-group">
              <label>Remaining Dues</label>
              <input
                type="number"
                name="remainingDues"
                value={form.remainingDues}
                readOnly
              />
            </div>
          )} */}
            </div>
          </>
        )}

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

export default EditOpdBilling;

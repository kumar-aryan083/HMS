import React, { useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import SearchableDropdown from "../ipd/SearchableDropdown";

const AddPharmacyBilling = ({ isOpen, onClose, onAddBilling, admissionId }) => {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    itemType: "",
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
    prescribedByName: "",
    prescribedBy: "",
  });

  const [payments, setPayments] = useState({
    paymentType: "credit",
    transactionId: "",
    paymentAmount: "",
  });

  const [items, setItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [showRailwayCode, setShowRailwayCode] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [patientType, setPatientType] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [prescribedById, setPrescribedById] = useState(null);
  const [prescribedByName, setPrescribedByName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [discountBy, setDiscountBy] = useState("");
  const [discountById, setDiscountById] = useState("");

  useEffect(() => {
    fetchPatientDetails();
    fetchDoctors();
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
  //   const selectedStaff = staffs.find(
  //     (staff) => staff._id === e.target.value
  //   );
  //   setDiscountBy(selectedStaff.name);
  //   setDiscountById(selectedStaff._id);
  // };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/employee/get-doctors`,
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
        // console.log("Doctors fetched:", data);
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const handleDoctorInput = (e) => {
    // console.log("doctors in input",doctors)
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      prescribedByName: value,
    }));
    if (value.length > 2) {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setForm((prevData) => ({
      ...prevData,
      prescribedBy: doctor._id,
      prescribedByName: doctor.name,
    }));
    setPrescribedById(doctor._id);
    setPrescribedByName(doctor.name);
    setFilteredDoctors([]);
  };

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
      finalPrice: totalDiscounted.toFixed(2),
    };
  };

  const [grandTotals, setGrandTotals] = useState({
    totalCharge: "0.00",
    totalDiscounted: "0.00",
    totalDiscount: "0.00",
    finalDiscount: "0.00",
    finalPrice: "0.00",
  });

  useEffect(() => {
    if (form.itemName) {
      if (isChecked && (form?.itemType === "all" || form.itemType === "ipd")) {
        // console.log(
        //   "true",
        //   form?.charge,
        //   form.charge + (form.charge * 15) / 100
        // );
        setForm((pre) => ({
          ...pre,
          abc: pre.charge,
          charge: pre.charge + (pre.charge * 15) / 100,
        }));
      } else {
        setForm((pre) => ({
          ...pre,
          charge: pre.abc,
        }));
      }
    }
  }, [isChecked, items]);

  useEffect(() => {
    setGrandTotals((pre) => ({ ...pre, ...calculateGrandTotals(items) }));
  }, [items, discount]);

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
  }, [form.charge, form.quantity, discount]);

  const handleDiscountChange = (e) => {
    setDiscount(e.target.value);
  };

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/patient/patients-list`,
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
        setPatients(data.patientDetails);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
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
            charge: selectedItem.pricePerUnit,
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
            charge: selectedItem.price,
            railwayCode: selectedItem.railwayCode || "",
          }));
          setShowRailwayCode(!!selectedItem.railwayCode);
        }
      }
    }
  };

  const handlePatientInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      patientName: value,
    }));

    if (value.length >= 3) {
      const filtered = patients.filter((patient) =>
        patient.patientName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  };

  const handlePatientSelect = (patient) => {
    // console.log("selected patient", patient);
    setForm((prevData) => ({
      ...prevData,
      patientId: patient._id,
      patientName: `${patient.patientName}`,
    }));
    setPatientName(patient.patientName);
    setPatientId(patient._id);
    setPatientType(patient.railwayType);
    setFilteredPatients([]);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    // console.log(form);
    if (form.itemName && form.charge && form.total !== "") {
      setItems((prevItems) => [...prevItems, form]);
      setForm((prevForm) => ({
        ...prevForm,
        itemName: "",
        abc: 0,
        charge: "",
        quantity: 1,
        totalCharge: "",
        total: "",
        paymentType: "",
        paymentAmount: "",
        remainingDues: "",
        transactionId: "",
        discount: 0,
        itemId: undefined,
        date: prevForm.date,
      }));
      setIsChecked(false);
      setShowRailwayCode(false);
    } else {
      alert("Please fill all fields before adding an item.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    const billingData = {
      item: items,
      patientId: patientId,
      patientName: patientName,
      prescribedBy: prescribedById,
      prescribedByName: prescribedByName,
      grandTotals: grandTotals,
      paymentInfo: {
        paymentType: payments.paymentType,
        paymentAmount:
          payments.paymentType === "credit" ? 0 : grandTotals.finalPrice,
        remainingDues:
          payments.paymentType === "credit" ? grandTotals?.finalPrice : 0,
        transactionId: "",
      },
      finalDiscountBy: discountBy,
      // finalDiscountById: discountById,
    };

    onAddBilling(billingData);
    onClose();
  };

  const handleDeleteItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <div className="ipd-billing-modal-overlay">
      <div className="ipd-billing-modal-content" style={{ height: "78%" }}>
        <button type="button" onClick={onClose} className="opd-closeBtn">
          X
        </button>
        <h3 className="ipd-billing-title">Add Billing Items</h3>
        <form className="opd-billing-form">
          <div className="form-row fg-group">
            {/* <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                onChange={handleChange}
                value={form.date}
                required
              />
            </div> */}
            <div className="form-group">
              <label>Patient Name:</label>
              <input
                className="form-input"
                type="text"
                name="patientName"
                value={form.patientName}
                onChange={handlePatientInput}
                placeholder="Search Patient by Name"
                autoComplete="off"
                disabled={items.length > 0}
              />
              {filteredPatients.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {filteredPatients.map((patient) => (
                    <li
                      key={patient._id}
                      onClick={() => handlePatientSelect(patient)}
                      className="dropdown-item"
                    >
                      {patient.patientName} ({patient.uhid})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group">
              <label>Doctor Name:</label>
              <input
                type="text"
                name="prescribedByName"
                value={form.prescribedByName}
                onChange={handleDoctorInput}
                placeholder="Search Doctor by Name"
                autoComplete="off"
                disabled={items.length > 0}
              />
              {filteredDoctors.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {filteredDoctors.map((doctor) => (
                    <li
                      key={doctor._id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="dropdown-item"
                    >
                      {doctor.name} ({doctor.phone})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group">
              <label>Item Name:</label>
              <SearchableDropdown
                billType={"pharmacy"}
                setForm={setForm}
                form={form}
                setShowRailwayCode={setShowRailwayCode}
                patientType={patientType}
                items={items}
              />
            </div>
            {/* <div className="form-group">
              <label>Bill Type</label>
              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                required
                disabled={items.length > 0}
              >
                <option value="">Select Category</option>
                <option value="all">All Categories</option>
                <option value="ipd">IPD</option>
              </select>
            </div> */}
          </div>
          <div className="form-row fg-group">
            {/* <div className="form-group">
              <label>Item Date</label>
              <input
                type="date"
                name="itemDate"
                value={form.itemDate}
                onChange={handleChange}
              />
            </div> */}

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
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                onChange={handleChange}
                value={form.quantity}
                required
              />
            </div>
            <div className="form-group">
              <label>Discount(%):</label>
              <input
                type="number"
                name="discount"
                onChange={handleChange}
                value={form.discount || ""}
              />
            </div>
            {(form?.itemType === "ipd" || form?.itemType === "all") && (
              <div
                className="form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <label>Is Private Admitted First</label>
              </div>
            )}
            <div className="form-group">
              <label>Total Price:</label>
              <input
                type="number"
                name="totalCharge"
                onChange={handleChange}
                value={form.totalCharge}
                required
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
                  {/* <th>Bill Type</th> */}
                  {/* <th>Item Date</th> */}
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
                    {/* <td>{item.itemType}</td> */}
                    {/* <td>{item.itemDate}</td> */}
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
                        parseFloat(e.target.value || 0)
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
                  // onChange={handleChange}
                  value={`${
                    parseFloat(grandTotals.finalPrice).toFixed(2) ?? ""
                  }`}
                  readOnly
                />
              </div>
              {/* <p>
                  <strong>Total Payable Price</strong>HHH
                </p> */}
              {/* </div> */}
            </div>
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
              <option value="credit">Credit</option>
              <option value="cash">Cash</option>
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
                value={`${parseFloat(grandTotals.finalPrice) ?? ""}`}
                required
                readOnly
                disabled
              />
            </div>
          )}
        </div>

        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddPharmacyBilling;

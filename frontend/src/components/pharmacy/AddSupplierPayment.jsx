import React, { useContext, useEffect, useState } from "react";
import "./styles/AddSupplier.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";
import AsyncSelect from "react-select/async";

const AddSupplierPayment = ({
  toggleConsumablesPopup,
  medicine = null,
  onClose = null,
  onUpdate = null,
  isView = false,
}) => {
  const { setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    supplierID: "",
    supplierName: "",
    billNumber: "",
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
  });
  const [preloadData, setPreloadData] = useState({
    supplierList: [],
    medicineList: [],
  });

  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
    }
    fetchMedicineList();
    fetchSupplierList();
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

  const fetchMedicineList = async () => {
    try {
      const res = await fetch(`${environment.url}/api/pharmacy/get-medicines`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        const medicineList = data.items.map((category) => {
          return {
            label: `${category.name}(${category.companyName})`,
            value: category._id,
          };
        });
        setPreloadData((pre) => ({
          ...pre,
          medicineList: medicineList,
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
              ...(label && { name: label }), // Add 'name' key only if 'label' is provided
              amount:
                field === "quantity" || field === "buyPrice"
                  ? (field === "quantity" ? +value || 0 : medicine.quantity) *
                    (field === "buyPrice" ? +value || 0 : medicine.buyPrice)
                  : medicine.amount,
            }
          : medicine
      );

      const updatedTotalAmount = updatedMedicines.reduce(
        (acc, medicine) => acc + (medicine.amount || 0),
        0
      );

      return {
        ...prevData,
        medicines: updatedMedicines,
        totalAmount: updatedTotalAmount,
      };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Supplier Added:", formData);
    try {
      if (onUpdate) {
        onUpdate(formData);
        onClose();
      } else {
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
            body: JSON.stringify(formData),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setNotification(data.message);
          setFormData({
            supplierID: "",
            supplierName: "",
            billNumber: "",
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

  return isView ? (
    <div className="view-bill-container">
      <h2>Bill Details</h2>
      <div className="bill-details">
        {/* Supplier and Bill Details */}
        <div className="form-row">
          <label>
            Supplier:
            <span>{formData.supplierName || "N/A"}</span>
          </label>
          <label>
            Bill Number:
            <span>{formData.billNumber || "N/A"}</span>
          </label>
          <label>
            Bill Date:
            <span>{formData.billDate || "N/A"}</span>
          </label>
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
        <div className="form-row">
          <label>
            Total Amount:
            <span>{formData.totalAmount || "N/A"}</span>
          </label>
        </div>
      </div>
    </div>
  ) : (
    <div className="ipd-billing-modal-overlay">
      <div className="ipd-billing-modal-content">
        <button
          type="button"
          onClick={onClose}
          className="ipd-billing-close-btn"
        >
          X
        </button>
        <h3 className="ipd-billing-title">Add Billing Items</h3>
        <form className="opd-billing-form">
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Item Type</label>
              <select
                name="itemType"
                value={"form.itemType"}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
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
                name="itemName"
                value={"form.itemName"}
                onChange={handleChange}
                required
              >
                <option value="">Select Item</option>
                {/* {itemOptions.map((item, index) => (
                  <option key={index} value={item.itemName}>
                    {item.itemName}
                  </option>
                ))} */}
              </select>
            </div>
            {/* {showRailwayCode && (
              <div className="form-group">
                <label>Railway Code:</label>
                <input
                  type="text"
                  name="railwayCode"
                  value={form.railwayCode}
                  readOnly
                />
              </div>
            )} */}
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                name="charge"
                onChange={handleChange}
                value={"form.charge"}
                required
              />
            </div>
          </div>
          <div className="form-row fg-group">
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                onChange={handleChange}
                value={"form.quantity"}
                required
              />
            </div>
            <div className="form-group">
              <label>Total Price:</label>
              <input
                type="number"
                name="totalCharge"
                onChange={handleChange}
                value={"form.totalCharge"}
                required
              />
            </div>
            <div className="form-group">
              <label>Discount (in %):</label>
              <input
                type="number"
                name="discount"
                onChange={handleChange}
                value={"form.discount"}
                required
              />
            </div>
            <div className="form-group">
              <label>Discounted Total:</label>
              <input
                type="number"
                name="total"
                onChange={handleChange}
                value={"form.total"}
                required
              />
            </div>
          </div>
          <button
            type="button"
            className="opd-billing-add-item-btn"
            // onClick={handleAddItem}
          >
            Add Item
          </button>
        </form>
        {/* {items.length > 0 && (
          <div>
            <table className="opd-billing-table">
              <thead>
                <tr>
                  <th>Item Type</th>
                  <th>Item Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total Prcie</th>
                  <th>Discount</th>
                  <th>Discounted Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemType}</td>
                    <td>{item.itemName}</td>
                    <td>{item.charge}</td>
                    <td>{item.quantity}</td>
                    <td>{item.totalCharge}</td>
                    <td>{item.discount}</td>
                    <td>{item.total}</td>
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
            <div class="bill-container">
              <p class="bill-column">Grand Totals:</p>
              <p class="bill-column">Total Price: ₹{grandTotals.totalCharge}</p>
              <p class="bill-column">
                Total Discount: ₹{grandTotals.totalDiscount}
              </p>
              <p class="bill-column">
                Final Price: ₹{grandTotals.totalDiscounted}
              </p>
            </div>
          </div>
        )} */}
        {/* Payment Section */}
        <div className="form-row fg-group ipd-bill-m">
          <div className="form-group">
            <label>Payment Type</label>
            <select
              name="paymentType"
              value={"form.paymentType"}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Type</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div className="form-group">
            <label>Enter Amount</label>
            <input
              type="number"
              name="paymentAmount"
              value={"form.paymentAmount"}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Remaining Dues</label>
            <input
              type="number"
              name="remainingDues"
              value={"form.remainingDues"}
              readOnly
            />
          </div>
        </div>
        <button
          type="button"
          className="ipd-billing-submit-btn"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddSupplierPayment;

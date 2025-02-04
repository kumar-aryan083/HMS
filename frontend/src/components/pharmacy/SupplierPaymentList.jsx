import React, { useContext, useEffect, useState } from "react";
import "./styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "./AddSupplier";
import AddMedicine from "./AddMedicine";
import AddSupplierBill from "./AddSupplierBill";
import AddSupplierPayment from "./AddSupplierPayment";
// import Consumables from "./Consumables";
// import EditConsumablePopup from "./EditConsumablePopup";

const SupplierPaymentList = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isSupplierEditPopupOpen, setIsSupplierEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const toggleConsumablesPopup = () => {
    setIsAddSupplierOpen(!isAddSupplierOpen);
    fetchSuppliers();
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/inventory/get-supplier-bill`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewSuppliers = () => {
    fetchSuppliers();
  };
  const handleDeleteSuppliers = async (medicineId) => {
    // console.log(medicineId);
    try {
      const res = await fetch(
        `${environment.url}/api/inventory/delete-supplier-bill/${medicineId}`,
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
        fetchSuppliers();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const openEditPopup = (medicine, isView = null) => {
    setEditedMedicine(medicine);
    if (isView) {
      setIsViewOpen(true);
      return;
    }
    setIsSupplierEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedMedicine(null);
    setIsSupplierEditPopupOpen(false);
  };

  const closeReadPopup = () => {
    setEditedMedicine(null);
    setIsViewOpen(false);
  };

  const handleUpdateSuppliers = async (updatedData) => {
    // console.log("Updated medicine data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/inventory/update-supplier-bill/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchSuppliers();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  return (
    <div className="consumable-list">
      <h2>Supplier Bills</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleConsumablesPopup} className="add-consumable-btn">
          Add Bill
        </button>
      </div>
      <hr className="am-h-line" />

      {/* Render the medications in a professional table */}
      <table className="consumable-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Supplier Name</th>
            <th>Bill Number</th>
            <th>Bill Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignedMedicines && assignedMedicines.length > 0 ? (
            assignedMedicines.map((med, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{med.supplierName || "N/A"}</td>
                <td>{med.billNumber ?? "N/A"}</td>
                <td>{med.billDate ?? "N/A"}</td>
                <td>{med.totalAmount ?? "N/A"}</td>
                <td>{med.status ?? "N/A"}</td>
                <td className="ipd-consumable-icons">
                  <FontAwesomeIcon
                    icon={faEye}
                    title="View"
                    className="consumable-icon"
                    onClick={() => openEditPopup(med, true)}
                  />
                  <FontAwesomeIcon
                    icon={faEdit}
                    title="Edit"
                    className="consumable-icon"
                    onClick={() => openEditPopup(med)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    title="Delete"
                    className="consumable-icon"
                    onClick={() => handleDeleteSuppliers(med._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No medicine assigned yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Popup rendering */}
      {isAddSupplierOpen && (
        <div className="consumable-popup">
          <div className="consumable-popup-content">
            <button
              className="consumable-close-popup-btn"
              onClick={toggleConsumablesPopup}
            >
              X
            </button>
            <AddSupplierPayment
              // admissionId={admissionId}
              toggleConsumablesPopup={toggleConsumablesPopup}
              // onAssign={handleNewConsumable}
            />
          </div>
        </div>
      )}

      {isViewOpen && (
        <div className="consumable-popup">
          <div className="consumable-popup-content">
            <button
              className="consumable-close-popup-btn"
              onClick={closeReadPopup}
            >
              X
            </button>
            <AddSupplierPayment
              // admissionId={admissionId}
              medicine={editedMedicine}
              isView={true}
              // onAssign={handleNewConsumable}
            />
          </div>
        </div>
      )}

      {isSupplierEditPopupOpen && (
        <div className="consumable-popup">
          <div className="consumable-popup-content">
            <button
              className="consumable-close-popup-btn"
              onClick={closeEditPopup}
            >
              X
            </button>
            <AddSupplierPayment
              medicine={editedMedicine}
              onClose={closeEditPopup}
              onUpdate={handleUpdateSuppliers}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPaymentList;

import React, { useContext, useEffect, useState } from "react";
import "./styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "./AddSupplier";
import AddTax from "./AddTax";
// import Consumables from "./Consumables";
// import EditConsumablePopup from "./EditConsumablePopup";

const TaxList = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isSupplierEditPopupOpen, setIsSupplierEditPopupOpen] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(null);

  const toggleConsumablesPopup = () => {
    setIsAddSupplierOpen(!isAddSupplierOpen);
    fetchSuppliers();
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${environment.url}/api/pharmacy/get-taxes`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
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
        `${environment.url}/api/pharmacy/delete-tax/${medicineId}`,
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

  const openEditPopup = (medicine) => {
    setEditedMedicine(medicine);
    setIsSupplierEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setEditedMedicine(null);
    setIsSupplierEditPopupOpen(false);
  };

  const handleUpdateSuppliers = async (updatedData) => {
    // console.log("Updated medicine data:", updatedData);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/edit-tax/${updatedData._id}`,
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
      <h2>Tax</h2>
      <div className="am-head">
        {/* Button to open the popup */}
        <button onClick={toggleConsumablesPopup} className="add-consumable-btn">
          Assign Tax
        </button>
      </div>
      <hr className="am-h-line" />

      {/* Render the medications in a professional table */}
      <table className="consumable-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Percentage</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignedMedicines && assignedMedicines.length > 0 ? (
            assignedMedicines.map((med, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{med.name || "N/A"}</td>
                <td>{med.percentage}</td>
                <td>{med.description}</td>

                <td className="ipd-consumable-icons">
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
                No Tax assigned yet.
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
            <AddTax
              // admissionId={admissionId}
              toggleConsumablesPopup={toggleConsumablesPopup}
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
            <AddTax
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

export default TaxList;

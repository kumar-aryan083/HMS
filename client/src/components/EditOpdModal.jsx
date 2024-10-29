import React, { useEffect, useState } from "react";
import "./styles/EditOpdModal.css";
import { useNavigate } from "react-router-dom";

const EditOpdModal = ({ isOpen, onClose, opdData, setNotification, onUpdateOpd }) => {
  if (!isOpen) return null;

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    appointment: {
      date: "",
      time: "",
      department: "",
      doctor: "",
      consultationType: "New Consultation",
      reasonForVisit: "",
    },
    administrativeDetails: {
      status: "open",
      consultationFee: "",
      paymentMode: "Cash",
      billingInformation: "",
      transactionId: "",
    },
  });

  useEffect(() => {
    if (isOpen && opdData) {
      setFormData({
        patientName: opdData.patientName || "",
        phone: opdData.patientId?.mobile || "",
        appointment: {
          date: opdData.appointment?.date || "",
          time: opdData.appointment?.time || "",
          department: opdData.appointment?.department || "",
          doctor: opdData.appointment?.doctor || "",
          consultationType:
            opdData.appointment?.consultationType || "New Consultation",
          reasonForVisit: opdData.appointment?.reasonForVisit || "",
        },
        administrativeDetails: {
          status: opdData.administrativeDetails?.status || "open",
          consultationFee: opdData.administrativeDetails?.consultationFee || "",
          paymentMode: opdData.administrativeDetails?.paymentMode || "Cash",
          billingInformation:
            opdData.administrativeDetails?.billingInformation || "",
          transactionId: opdData.administrativeDetails?.transactionId || "",
        },
      });
    }
  }, [isOpen, opdData]);

  useEffect(() => {
    if (isOpen) {
      document.title = "OPD Form | HMS";
      fetchDepartments();
      fetchDoctors();
    }
  }, [isOpen, onClose]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/admin/get-departments",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments: ", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/employee/get-doctors",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors: ", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const keys = name.split(".");
      if (keys.length === 1) {
        return { ...prev, [name]: value };
      }
      if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
        };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const res = await fetch(`http://localhost:8000/api/opd/update-opd/${opdData._id}`,{
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(res.ok){
        setNotification(data.message);
        onUpdateOpd(data.updatedOpd);
        onClose();
      }else{
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <form className="opd-form-container" onSubmit={handleSubmit}>
          <h2 className="opd-form-heading">Edit OPD Details</h2>

          {/* Patient Information */}
          <h3>Patient Information</h3>
          <div className="headline-line h-line-extra"></div>
          <div className="opd-input-pair">
            <div className="opd-form-group">
              <label>Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div className="opd-form-group">
              <label>
                Patient Phone <span className="required">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                readOnly
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="opd-input-pair">
            <div className="opd-form-group">
              <label>
                Appointment Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="appointment.date"
                value={formData.appointment.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="opd-form-group">
              <label>Time</label>
              <input
                type="time"
                name="appointment.time"
                value={formData.appointment.time}
                onChange={handleInputChange}
              />
            </div>
            <div className="opd-form-group">
              <label>
                Department <span className="required">*</span>
              </label>
              <select
                name="appointment.department"
                value={formData.appointment.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="opd-input-pair">
            <div className="opd-form-group">
              <label>
                Doctor <span className="required">*</span>
              </label>
              <select
                type="text"
                name="appointment.doctor"
                value={formData.appointment.doctor}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doct) => (
                  <option key={doct._id} value={doct._id}>
                    {doct.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="opd-form-group">
              <label>
                Consultation Type <span className="required">*</span>
              </label>
              <select
                name="appointment.consultationType"
                value={formData.appointment.consultationType}
                onChange={handleInputChange}
                required
              >
                <option value="New Consultation">New Consultation</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
            <div className="opd-form-group">
              <label>Reason for Visit</label>
              <input
                type="text"
                name="appointment.reasonForVisit"
                value={formData.appointment.reasonForVisit}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Administrative Details */}
          <h3>Administrative Details</h3>
          <div className="headline-line h-line-extra"></div>
          <div className="opd-input-pair">
            <div className="opd-form-group">
              <label>Status</label>
              <select
                name="administrativeDetails.status"
                value={formData.administrativeDetails.status}
                onChange={handleInputChange}
              >
                <option value="open">Open</option>
                <option value="close">Close</option>
              </select>
            </div>
            <div className="opd-form-group">
              <label>Consultation Fee</label>
              <input
                type="number"
                name="administrativeDetails.consultationFee"
                value={formData.administrativeDetails.consultationFee}
                onChange={handleInputChange}
              />
            </div>
            <div className="opd-form-group">
              <label>Payment Mode</label>
              <select
                name="administrativeDetails.paymentMode"
                value={formData.administrativeDetails.paymentMode}
                onChange={handleInputChange}
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Insurance">Insurance</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          {formData.administrativeDetails.paymentMode == "UPI" && (
            <div className="opd-input-pair">
              <div className="opd-form-group">
                <label>Billing Information</label>
                <input
                  type="text"
                  name="administrativeDetails.billingInformation"
                  value={formData.administrativeDetails.billingInformation}
                  onChange={handleInputChange}
                />
              </div>

              <div className="opd-form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  name="administrativeDetails.transactionId"
                  value={formData.administrativeDetails.transactionId}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          <button type="submit" className="opd-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditOpdModal;

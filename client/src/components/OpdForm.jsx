import React, { useEffect, useState } from "react";
import "./styles/OpdForm.css";
import { useNavigate } from "react-router-dom";

const OpdForm = ({setNotification, user}) => {
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
  const nav = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const [section, key] = name.split(".");

    if (key) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    document.title = "OPD Form | HMS";
    if(!user){
        setNotification("Login first to access this page.")
        nav('/emp-login');
    }
    fetchDepartments();
    fetchDoctors();
  }, [user]);

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
      console.log("Error message: ", error);
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
      console.log("Error message: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const res = await fetch("http://localhost:8000/api/opd/create-opd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setFormData({
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
      }else{
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Submission error", error);
    }
  };

  return (
    <form className="opd-form-container" onSubmit={handleSubmit}>
      <h2 className="opd-form-heading">OPD Form</h2>

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
          />
        </div>
        <div className="opd-form-group">
          <label>Patient Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Appointment Details */}
      <div className="opd-input-pair">
        <div className="opd-form-group">
          <label>Appointment Date</label>
          <input
            type="date"
            name="appointment.date"
            value={formData.appointment.date}
            onChange={handleInputChange}
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
          <label>Department</label>
          <select
            type="text"
            name="appointment.department"
            value={formData.appointment.department}
            onChange={handleInputChange}
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
          <label>Doctor</label>
          <select
            type="text"
            name="appointment.doctor"
            value={formData.appointment.doctor}
            onChange={handleInputChange}
          >
            <option value="">Select Department</option>
            {doctors.map((doct) => (
              <option key={doct._id} value={doct._id}>
                {doct.name}
              </option>
            ))}
          </select>
        </div>
        <div className="opd-form-group">
          <label>Consultation Type</label>
          <select
            name="appointment.consultationType"
            value={formData.appointment.consultationType}
            onChange={handleInputChange}
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
  );
};

export default OpdForm;

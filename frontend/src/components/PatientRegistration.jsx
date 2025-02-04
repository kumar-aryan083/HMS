import React, { useContext, useEffect, useState } from "react";
import "./styles/PatientRegistration.css"; // Import the CSS for styling
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { environment } from "../../utlis/environment.js";
import { getUserDetails } from "../../utlis/userDetails.js";

const PatientRegistration = () => {
  const { setNotification } = useContext(AppContext);

  const nav = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    patientType: "",
    railwayType: "",
    paymentType: "",
    departmentDesignation: "",
    crnNumber: "",
    ummidCard: "",
    email: "",
    gender: "",
    aadhar: "",
    height: "",
    weight: "",
    mobile: "",
    firstAddress: "",
    secondAddress: "",
    state: "",
    district: "",
    country: "",
    pincode: "",
    bloodGroup: "",
    doctor: "",
    patientImg: "",
    age: "",
    birthday: "",
    insuranceProvider: "",
    insuranceName: "",
    cardNumber: "",
    insuranceNumber: "",
    facilityCode: "",
    initialBalance: "",
    guarantorName: "",
    guarantorMobile: "",
    guarantorRelationship: "",
    gurantorGender: "",
    salutation: "",
    maritalStatus: "",
    occupation: "",
    emgContact: "",
    tpaCorporate: "",
  });
  const [patientTypes, setPatientTypes] = useState([]);
  const [isRailway, setIsRailway] = useState(false);

  useEffect(() => {
    fetchPatientTypes();
  }, []);

  const fetchPatientTypes = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/common/get-patient-type`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setPatientTypes(data.patientTypes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "patientType") {
      const selectedPatientType = patientTypes.find(
        (type) => type._id === e.target.value
      );
      setIsRailway(selectedPatientType.name.toLowerCase() === "railway");
    }
  };

  // Function to calculate age
  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // const handleBirthdayChange = (e) => {
  //   const birthday = e.target.value;
  //   const age = calculateAge(birthday);
  //   setFormData({
  //     ...formData,
  //     birthday,
  //     // age: age >= 0 ? age : "",
  //   });
  // };

  const onSubmit = async (e) => {
    e.preventDefault();
    // console.log("patient registration details - ", formData);
    const userDetails = getUserDetails();
    const updatedForm = {...formData, ...userDetails};
    // console.log("patient data going for registration: ", updatedForm);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/patient-register`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(updatedForm),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        nav("/patient-list");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{marginBottom: "5px"}}>Patient Registration</h2>
      <form onSubmit={onSubmit}>
        <div className="form-headline">
          <p>Basic Information</p>
          <div className="headline-line"></div>
        </div>

          <div className="salutation">
            <label>Salutation</label>
            <select
              name="salutation"
              value={formData.salutation}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Mst">Mst</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
              <option value="Ms">Ms</option>
              {/* Add more salutations as needed */}
            </select>
          </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label className="pr-label">Full Name</label>

            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="pr-label">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label className="pr-label">Aadhar Number</label>
            <input
              type="number"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="pr-label">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="pr-label">Birthday</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="pr-label">Payment Type</label>
            <select
              name="paymentType"
              id="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
            >
              <option value="">Select Payment Type</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label className="pr-label">Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="pr-label">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="B+">B+</option>
              <option value="AB-">AB-</option>
              <option value="AB+">AB+</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
              <option value="A+">A+</option>
            </select>
          </div>
          <div className="form-group">
            <label>Height (in cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Weight (in kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="o-label">Patient Type</label>
            <select
              name="patientType"
              value={formData.patientType}
              onChange={handleChange}
            >
              <option value="">Select Patient Type</option>
              {patientTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {isRailway && (
            <div className="form-group">
              <label>Railway Type</label>
              <select
                name="railwayType"
                value={formData.railwayType}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="nabh">Nabh</option>
                <option value="nonNabh">Non-Nabh</option>
              </select>
            </div>
          )}

          {isRailway && (
            <div className="form-group">
              <label>Department & Designation</label>
              <input
                name="departmentDesignation"
                value={formData.departmentDesignation}
                onChange={handleChange}
              />
            </div>
          )}

          {isRailway && (
            <div className="form-group">
              <label>UMMID Card No.</label>
              <input
                name="ummidCard"
                value={formData.ummidCard}
                onChange={handleChange}
              />
            </div>
          )}

          {isRailway && (
            <div className="form-group">
              <label>CR Number</label>
              <input
                name="crnNumber"
                value={formData.crnNumber}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              {/* Add more options if needed */}
            </select>
          </div>
          <div className="form-group">
            <label className="pr-label">Emergency Contact No.</label>
            <input
              type="number"
              name="emgContact"
              value={formData.emgContact}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-headline">
          <p>Address Details</p>
          <div className="headline-line"></div>
        </div>

        <div className="form-row fg-group">
          <div className="form-group">
            <label className="pr-label">Address Line 1</label>
            <input
              type="text"
              name="firstAddress"
              value={formData.firstAddress}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              name="secondAddress"
              value={formData.secondAddress}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="pr-label">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="pr-label">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="pr-label">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="pr-label">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-headline">
          <p>Additional Details</p>
          <div className="headline-line"></div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>Doctor</label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Patient Image</label>
            <input type="file" name="patientImg" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Guarantor Name</label>
            <input
              type="text"
              name="guarantorName"
              value={formData.guarantorName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Guarantor's Mobile No.</label>
            <input
              type="Number"
              name="guarantorMobile"
              value={formData.guarantorMobile}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Guarantor's Gender</label>
            <select
              name="gurantorGender"
              value={formData.gurantorGender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Relationship with patient</label>
            <input
              type="text"
              name="guarantorRelationship"
              value={formData.guarantorRelationship}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-headline">
          <p>Insurance Details</p>
          <div className="headline-line"></div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>TPA/Corporate</label>
            <input
              type="text"
              name="tpaCorporate"
              value={formData.tpaCorporate}
              onChange={handleChange}
              placeholder="Enter TPA/Corporate"
            />
          </div>
          <div className="form-group">
            <label>Insurance Name</label>
            <input
              type="text"
              name="insuranceName"
              value={formData.insuranceName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Card Number (ID No.)</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Insurance Number (Member No.)</label>
            <input
              type="text"
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Facility Code</label>
            <input
              type="text"
              name="facilityCode"
              value={formData.facilityCode}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Initial Balance</label>
            <input
              type="number"
              name="initialBalance"
              value={formData.initialBalance}
              onChange={handleChange}
            />
          </div>
        </div>
        <button type="submit" style={{fontWeight: "600"}}>
          Register
        </button>
      </form>
    </div>
  );
};

export default PatientRegistration;

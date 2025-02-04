import React, { useEffect, useState, useContext } from "react";
import "./styles/OpdProfile.css";
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const OpdProfile = ({ opdId }) => {
  const [opdData, setOpdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setNotification } = useContext(AppContext);

  useEffect(() => {
    fetchOpdData();
  }, [opdId]);

  const fetchOpdData = async () => {
    try {
      const response = await fetch(`${environment.url}/api/opd/get-opd/${opdId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await response.json();
      if (response.ok) {
        setOpdData(data.opdDetails);
      } else {
        setError(data.message || "Failed to fetch OPD data.");
      }
    } catch (err) {
      setError("Error fetching OPD data.");
    }
    setLoading(false);
  };

  if (loading) return <p>Loading OPD Profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="opd-profile">
      <h1 className="opd-profile-title">Outpatient Profile</h1>
      <div className="opd-profile-grid">
        <div className="opd-profile-section">
          <h2>Patient Details</h2>
          <p><strong>Name:</strong> {opdData?.patientName}</p>
          <p><strong>UHID:</strong> {opdData?.patientId?.uhid}</p>
          <p><strong>Gender:</strong> {opdData?.patientId?.gender}</p>
          <p><strong>Age:</strong> {opdData?.patientId?.age} yrs</p>
          <p><strong>Height:</strong> {opdData?.patientId?.height} cm</p>
          <p><strong>Weight:</strong> {opdData?.patientId?.weight} kg</p>
          <p><strong>Blood Group:</strong> {opdData?.patientId?.bloodGroup}</p>
        </div>
        <div className="opd-profile-section">
          <h2>Appointment Details</h2>
          <p><strong>Date:</strong> {opdData?.appointment?.date ? new Date(opdData.appointment.date).toLocaleDateString() : "N/A"}</p>
          <p><strong>Time:</strong> {opdData?.appointment?.time || "N/A"}</p>
          <p><strong>Department:</strong> {opdData?.appointment?.department?.name || "N/A"}</p>
          <p><strong>Doctor:</strong> {opdData?.appointment?.doctor?.name || "N/A"}</p>
          <p><strong>Consultation Type:</strong> {opdData?.appointment?.consultationType}</p>
          <p><strong>Reason for Visit:</strong> {opdData?.appointment?.reasonForVisit}</p>
        </div>
      </div>
      <div className="opd-profile-section">
        <h2>Assessment</h2>
        <div dangerouslySetInnerHTML={{ __html: opdData?.assessment }}></div>
      </div>
    </div>
  );
};

export default OpdProfile;

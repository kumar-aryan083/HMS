import React, { useContext, useEffect, useState } from "react";
import "./styles/OpdProfile.css";
import { AppContext } from "../context/AppContext";

const OpdProfile = ({ opdId }) => {
  const [opdData, setOpdData] = useState({});
  const [followUpHistory, setFollowUpHistory] = useState([]);
  const {setNotification} = useContext(AppContext);

  useEffect(() => {
    fetchOpdData();
    fetchFollowUpHistory();
  }, [opdId]);

  const fetchFollowUpHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/opd/${opdId}/followup-history`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setFollowUpHistory(data.followUpHistory);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching follow-up history:", error);
    }
  };

  const fetchOpdData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/opd/get-opd/${opdId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setOpdData(data.opdDetails);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      setNotification("Error fetching OPD details");
    }
  };

  if (!opdData) return <div>Loading...</div>;

  return (
    <div className="opd-profile-container">
      <h2>OPD Profile</h2>

      {/* Patient Information Section */}
      <section className="opd-section">
        <h3>Patient Information</h3>
        <div className="opd-flex-container">
          <div className="opd-info">
            <p>
              <strong>Name:</strong> {opdData.patientName}
            </p>
            <p>
              <strong>UHID:</strong> {opdData.patientId?.uhid}
            </p>
            <p>
              <strong>Gender:</strong> {opdData.patientId?.gender}
            </p>
            <p>
              <strong>Age:</strong> {opdData.patientId?.age}
            </p>
          </div>
          <h3>Appointment Details</h3>
          <div className="opd-info">
            <p>
              <strong>Date:</strong>{" "}
              {opdData.appointment?.date
                ? new Date(opdData.appointment.date).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Time:</strong> {opdData.appointment?.time || "N/A"}
            </p>
            <p>
              <strong>Department:</strong>{" "}
              {opdData.appointment?.department?.name || "N/A"}
            </p>
            <p>
              <strong>Doctor:</strong>{" "}
              {opdData.appointment?.doctor?.name || "N/A"}
            </p>
            <p>
              <strong>Consultation Type:</strong>{" "}
              {opdData.appointment?.consultationType}
            </p>
            <p>
              <strong>Reason for Visit:</strong>{" "}
              {opdData.appointment?.reasonForVisit}
            </p>
          </div>
        </div>
      </section>

      {/* Treatment Section */}
      <section className="opd-section">
        <h3>Treatment</h3>
        <h4>Medications</h4>
        {opdData.treatment?.medications?.length > 0 ? (
          <table className="opd-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
              </tr>
            </thead>
            <tbody>
              {opdData.treatment.medications.map((med, index) => (
                <tr key={index}>
                  <td>{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-medications">No medications assigned yet.</p>
        )}

        <h4>Allergies</h4>
        <div className="allergy-container">
          {opdData.treatment?.allergies?.length > 0 ? (
            opdData.treatment.allergies.map((allergy, index) => (
              <div key={index} className="allergy-card">
                <div className="allergy-details">
                  <p>
                    <strong>Name:</strong> {allergy.name}
                  </p>
                  <p>
                    <strong>Severity:</strong> {allergy.severity}
                  </p>
                </div>
                <div className="allergy-notes">
                  <h5>Notes:</h5>
                  <div
                    className="allergy-notes-content"
                    dangerouslySetInnerHTML={{ __html: allergy.notes }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-allergies">No allergies reported.</p>
          )}
        </div>

        <h4>Assigned Tests</h4>
        <div className="assigned-tests-container">
          {opdData.treatment?.assignedTests?.length > 0 ? (
            opdData.treatment.assignedTests.map((test, index) => (
              <div key={index} className="assigned-test-card">
                <h5>{test.testId?.name || "N/A"}</h5>
                <p>
                  <strong>Status:</strong> {test.status}
                </p>
                <p>
                  <strong>Results:</strong> {test.results || "Pending"}
                </p>
              </div>
            ))
          ) : (
            <p className="no-tests">No tests assigned yet.</p>
          )}
        </div>
      </section>

      {/* Administrative Details Section */}
      <section className="opd-section">
        <h3>Administrative Details</h3>
        <div className="opd-info">
          <p>
            <strong>Status:</strong> {opdData.administrativeDetails?.status}
          </p>
          <p>
            <strong>Consultation Fee:</strong> $
            {opdData.administrativeDetails?.consultationFee}
          </p>
          <p>
            <strong>Payment Mode:</strong>{" "}
            {opdData.administrativeDetails?.paymentMode}
          </p>
          <p>
            <strong>Transaction ID:</strong>{" "}
            {opdData.administrativeDetails?.transactionId}
          </p>
        </div>
      </section>

      {/* Assessment Section */}
      <section className="opd-section">
        <h3>Assessment</h3>
        <p>{opdData.assessment || "No assessment recorded"}</p>
      </section>

      {/* Payment History Section */}
      <section className="opd-section">
        <h3>Payment History</h3>
        <table className="opd-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Purpose</th>
              <th>Consultation Fee</th>
              <th>Payment Mode</th>
              <th>Transaction Id</th>
            </tr>
          </thead>
          <tbody>
            {opdData.paymentIds?.map((payment, index) => (
              <tr key={index}>
                <td>{payment._id}</td>
                <td>Rs {payment.amount}</td>
                <td>{new Date(payment.date).toLocaleDateString()}</td>
                <td>{payment?.purpose ?? "N/A"}</td>
                <td>
                  {opdData.administrativeDetails?.consultationFee ?? "N/A"}
                </td>
                <td>{opdData.administrativeDetails?.paymentMode ?? "N/A"}</td>
                <td>{payment?.transactionId ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Follow up history */}
      <section>
        <div className="follow-up-history-container">
          <h3>Follow-Up History</h3>
          <table className="follow-up-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Notes</th>
                <th>Assigned By</th>
              </tr>
            </thead>
            <tbody>
              {followUpHistory.length > 0 ? (
                followUpHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td><div
                    className="allergy-notes-content"
                    dangerouslySetInnerHTML={{ __html: entry.notes }}
                  ></div></td>
                    <td>{entry.assignedBy?.name || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-history">
                    No follow-up history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default OpdProfile;

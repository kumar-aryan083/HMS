import React, { useEffect, useState } from "react";
import "./styles/IpdProfile.css";
import { environment } from "../../../utlis/environment";

const IpdProfile = ({ admissionId }) => {
  const [ipdData, setIpdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIPDData = async () => {
      try {
        const response = await fetch(
          `${environment.url}/api/ipd/get-ipd/${admissionId}`,
          {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          // console.log(data);
          setIpdData(data);
        } else {
          setError(data.message || "Failed to fetch IPD data.");
        }
      } catch (err) {
        setError("Error fetching IPD data.");
      }
      setLoading(false);
    };

    fetchIPDData();
  }, [admissionId]);

  if (loading) return <p>Loading IPD Profile...</p>;
  if (error) return <p className="error">{error}</p>;

  const {
    patientId: patient,
    dischargeSummary,
    doctorId,
    wardHistory,
    reasonForAdmission,
    physicalExamination,
    timeOfAdmission
  } = ipdData;

  const latestWardHistory = wardHistory?.[wardHistory.length - 1] || null;

  return (
    <div className="ipd-profile">
      <h1 className="ipd-profile-title">Inpatient Profile</h1>
      <div className="ipd-profile-grid">
        <div className="ipd-profile-section">
          <h2>Patient Details</h2>
          <p>
            <strong>UHID:</strong> {patient?.uhid}
          </p>
          <p>
            <strong>Name:</strong> {patient?.patientName}
          </p>
          <p>
            <strong>Age:</strong> {patient?.age}
          </p>
          <p>
            <strong>Gender:</strong> {patient?.gender}
          </p>
          <p>
            <strong>Contact:</strong> {patient?.mobile}
          </p>
          <p>
            <strong>Height:</strong> {patient?.height} cm
          </p>
          <p>
            <strong>Weight:</strong> {patient?.weight} kg
          </p>
          <p>
            <strong>Blood Group:</strong> {patient?.bloodGroup}
          </p>
        </div>
        <div className="ipd-profile-section">
          <h2>Admission Details</h2>
          <p>
            <strong>Time of Admission:</strong> {timeOfAdmission}
          </p>
          <p>
            <strong>Admission Reason:</strong> {reasonForAdmission}
          </p>
          <p>
            <strong>Doctor:</strong> {doctorId?.name}
          </p>
          {latestWardHistory ? (
            <>
              <p>
                <strong>Wing:</strong> {latestWardHistory?.wingId?.name}
              </p>
              <p>
                <strong>Room:</strong> {latestWardHistory?.roomId?.roomNumber}
              </p>
              <p>
                <strong>Bed:</strong> {latestWardHistory?.bedName}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {new Date(latestWardHistory?.updatedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p>
              <strong>Ward History:</strong> No ward history available.
            </p>
          )}
        </div>
      </div>
      {dischargeSummary && (
        <div className="ipd-profile-section">
          <h2>Discharge Summary</h2>
          <p>
            <strong>Discharge Date:</strong>{" "}
            {dischargeSummary.dischargeDate ? new Date(dischargeSummary.dischargeDate).toLocaleDateString(): ""}
          </p>
          <p>
            <strong>Status at Discharge:</strong>{" "}
            {dischargeSummary.statusAtDischarge}
          </p>
          <p>
            <strong>Mode of Discharge:</strong> {dischargeSummary.dischargeMode}
          </p>
          <h3 style={{margin:"0"}}>Medications</h3>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.medications }} />
          {/* <table className="medications-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
              </tr>
            </thead>
            <tbody>
              {dischargeSummary.medications.length > 0 ? (
                dischargeSummary.medications.map((medication) => (
                  <tr key={medication._id}>
                    <td>{medication.name}</td>
                    <td>{medication.dosage}</td>
                    <td>{medication.frequency}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "left" }}>
                    No Medicine is assigned for discharge yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table> */}
          {/* <p><strong>Discharge Notes:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.dischargeNotes }} />
          <p><strong>Final Diagnosis:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.finalDiagnosis }} />
          <p><strong>Complications:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.complications }} />
          <p><strong>Details of the patient's condition during hospitalization:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.patientCondition }} />
          <p><strong>Key Interventions:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.keyInterventions }} />
          <p><strong>Followup Instructions:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.followupInstructions }} />
          <p><strong>Dietary Instructions:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.dietaryInstructions }} />
          <p><strong>Activity Recommendations:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.activityRecommendations }} />
          <p><strong>Wound Care or Other Specific Care Instructions:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.woundCareInstructions }} />
          <p><strong>When to seek emergency care:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.emergencyCareWhen }} />
          <p><strong>How to seek emergency care:</strong></p>
          <div dangerouslySetInnerHTML={{ __html: dischargeSummary.emergencyCareHow }} /> */}
          <table className="table">
            <tbody>
              {[
                {
                  label: "Discharge Date",
                  value: new Date(
                    dischargeSummary?.dischargeDate
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) || "N/A",
                },
                {
                  label: "Discharging Doctor",
                  value: dischargeSummary?.dischargingDoctor?.name || "N/A",
                },
                {
                  label: "Mode of Discharge",
                  value: dischargeSummary?.dischargeMode || "N/A",
                },
                {
                  label: "Discharge Notes",
                  value: dischargeSummary?.dischargeNotes || "N/A",
                },
                {
                  label: "Final Diagnosis",
                  value: dischargeSummary?.finalDiagnosis || "N/A",
                },
                {
                  label: "Complications (if any)",
                  value: dischargeSummary?.complications || "N/A",
                },
                {
                  label: "Condition during hospitalization",
                  value: dischargeSummary?.patientCondition || "N/A",
                },
                {
                  label: "Key Interventions",
                  value: dischargeSummary?.keyInterventions || "N/A",
                },
                {
                  label: "Follow-Up Instructions",
                  value: dischargeSummary?.followUpInstructions || "N/A",
                },
                {
                  label: "Dietary Instructions",
                  value: dischargeSummary?.dietaryInstructions || "N/A",
                },
                {
                  label: "Activity Recommendations",
                  value: dischargeSummary?.activityRecommendations || "N/A",
                },
                {
                  label: "Wound Care Instructions",
                  value: dischargeSummary?.woundCareInstructions || "N/A",
                },
                {
                  label: "When to Seek Emergency Care",
                  value: dischargeSummary?.emergencyCareWhen || "N/A",
                },
                {
                  label: "How to Seek Emergency Care",
                  value: dischargeSummary?.emergencyCareHow || "N/A",
                },
              ].map((detail, index) => (
                <tr key={index}>
                  <td className="label">{detail.label}</td>
                  <td
                    className="value"
                    dangerouslySetInnerHTML={{ __html: detail.value }}
                  ></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="ipd-profile-section">
        <h2>Physical Examination</h2>
        <div className="ipd-profile-grid fg-group">
          <div>
            <p>
              <strong>Blood Pressure:</strong>{" "}
              {physicalExamination?.vitalSigns?.bloodPressure}
            </p>
            <p>
              <strong>Heart Rate:</strong>{" "}
              {physicalExamination?.vitalSigns?.heartRate}
            </p>
            <p>
              <strong>Temperature:</strong>{" "}
              {physicalExamination?.vitalSigns?.temperature}
            </p>
          </div>
          <div>
            <p>
              <strong>Respiratory Rate:</strong>{" "}
              {physicalExamination?.vitalSigns?.respiratoryRate}
            </p>
            <p>
              <strong>Oxygen Saturation:</strong>{" "}
              {physicalExamination?.vitalSigns?.oxygenSaturation}
            </p>
            <p>
              <strong>BMI:</strong> {physicalExamination?.vitalSigns?.bmi}
            </p>
          </div>
        </div>
        <p>
          <strong>Other Findings: </strong>
          <span
            dangerouslySetInnerHTML={{
              __html: physicalExamination?.findings,
            }}
          />
        </p>
      </div>
    </div>
  );
};

export default IpdProfile;

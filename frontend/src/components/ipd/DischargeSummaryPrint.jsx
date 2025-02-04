// DischargeSummary.js
import React, { useContext, useEffect, useState } from "react";
import "./styles/DischargeSummaryPrint.css";
import prakashLogo from "../../assets/prakashLogo.jpg";
// import prakashLogoPng from "../../assets/prakashLogoPng.png";
// import { AppContext } from "../../context/AppContext";

const DischargeSummaryPrint = ({
  patientData,
  dischargeSummary,
  documentRef,
  ipdData,
}) => {
  useEffect(() => {
    // console.log("discharge summay print", dischargeSummary);
  }, []);
  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);

    if (isNaN(date)) {
      throw new Error("Invalid date");
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <div ref={documentRef} className="ipd-bill-layout print-content print-only">
      {/* <div className="total-bill-image-container">
        <img src={prakashSurgicalImage} alt="Hospital" className="ds-hospital-image" />
      </div> */}

      {/* Custom Header */}
      <div className="custom-header">
        <img src={prakashLogo} alt="Hospital Logo" className="hospital-logo" />
        <div className="header-text">
          <h2 className="hospital-name" style={{ marginBottom: "0" }}>
            New Prakash Surgical Clinic
          </h2>
          <p className="hospital-address">
            38 C Circular Road, Opp. Kauwa Bagh Police Station, Gorakhpur
            (273012) UP
          </p>
        </div>
        <img src={prakashLogo} alt="Hospital Logo" className="hospital-logoo" />
      </div>

      <h2 className="header">Discharge Summary</h2>

      <h3 className="sub-header">Patient Details</h3>
      <div className="top-border">
        <div className="patient-details-container">
          {[
            { label: "Patient Name", value: patientData?.name },
            { label: "UHID", value: patientData?.uhid },
            {
              label: "Age/Gender",
              value: `${patientData?.age || "N/A"} / ${
                patientData?.gender?.toUpperCase() || "N/A"
              }`,
            },
            { label: "Mobile", value: patientData?.phone || "N/A" },
            patientData?.tpaCorporate?.trim() && {
              label: "TPA/Corporate",
              value: patientData?.tpaCorporate,
            },
            patientData?.crnNumber?.trim() && {
              label: "CRN Number",
              value: patientData?.crnNumber,
            },
            patientData?.ummidCard?.trim() && {
              label: "UMMID Number",
              value: patientData?.ummidCard,
            },
            patientData?.referenceLetter?.trim() && {
              label: "Ref. Letter No.",
              value: patientData?.referenceLetter,
            },
            { label: "Doctor", value: patientData?.doctorName || "N/A" },
            {
              label: "Admitted Ward",
              value: `${patientData?.wingName?.toUpperCase() || "N/A"}`,
            },
            {
              label: "Admission Date",
              value: patientData?.admissionDate
                ? formatDateToDDMMYYYY(patientData?.admissionDate)
                : "N/A",
            },
            {
              label: "Admission Time",
              value: ipdData?.timeOfAdmission || "N/A",
            },
            {
              label: "Discharge Date",
              value: dischargeSummary?.dischargeDate
                ? formatDateToDDMMYYYY(dischargeSummary.dischargeDate)
                : "N/A",
            },
            {
              label: "Discharge Time",
              value: dischargeSummary?.dischargeTime || "N/A",
            },
          ]
            .filter(
              (detail) =>
                detail && // Ensure detail is not null or undefined
                detail.label && // Ensure label exists
                detail.value && // Ensure value exists
                String(detail.value).trim() !== "" // Ensure value is not empty
            )
            .map((detail, index) => (
              <div key={index} className="patient-detail">
                <div className="patient-label">{detail.label}</div>
                <div className="patient-value">{detail.value}</div>
              </div>
            ))}
        </div>
      </div>
      <div>
        <div className="additional-section">
          <h3 className="sub-header">Discharge Details</h3>
          {/* <p className="ds-para">
            <strong className="ds-strong">Discharge Date:</strong>{" "}
            {formatDateToDDMMYYYY(dischargeSummary.dischargeDate)}
          </p> */}
          <p className="ds-para">
            <strong className="ds-strong">Mode of Discharge:</strong>{" "}
            <p>{dischargeSummary.dischargeMode}</p>
          </p>
          <p className="ds-para">
            <strong className="ds-strong">Status at Discharge:</strong>{" "}
            <p>{dischargeSummary.statusAtDischarge}</p>
          </p>
          <p className="ds-para">
            <strong className="ds-strong">Number of days stayed:</strong>{" "}
            <p>{dischargeSummary.numberOfDays}</p>
          </p>
          {/* <div>
            <p className="ds-para">
              <strong className="ds-strong">Discharge Notes:</strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.dischargeNotes || "N/A",
              }}
            />
          </div> */}
          <div>
            <p className="ds-para">
              <strong className="ds-strong">Diagnosis:</strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.finalDiagnosis || "N/A",
              }}
            />
          </div>
          {/* <div>
            <p className="ds-para">
              <strong className="ds-strong">Complications:</strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.complications || "N/A",
              }}
            />
          </div>
          <div>
            <p className="ds-para">
              <strong className="ds-strong">
                Details of the patient's condition during hospitalization:
              </strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.patientCondition || "N/A",
              }}
            />
          </div>*/}
          <div>
            <p className="ds-para">
              <strong className="ds-strong">Presenting Complaints:</strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.keyInterventions || "N/A",
              }}
            />
          </div>

          <div>
            <p className="ds-para">
              <strong className="ds-strong">Past History:</strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.dietaryInstructions || "N/A",
              }}
            />
          </div>
          <div>
            <p className="ds-para">
              <strong className="ds-strong">
                General Physical & Systemic Examination:
              </strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.activityRecommendations || "N/A",
              }}
            />
          </div>
          <div>
            <p className="ds-para">
              <strong className="ds-strong">
                Procedure / Operation Detail:
              </strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.woundCareInstructions || "N/A",
              }}
            />
          </div>
          <div>
            <p className="ds-para">
              <strong className="ds-strong">
                Treatment and Course During Hospitalization:
              </strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.emergencyCareWhen || "N/A",
              }}
            />
          </div>
          <div>
            <p className="ds-para">
              <strong className="ds-strong">
                Where to seek emergency care:
              </strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.emergencyCareHow || "N/A",
              }}
            />
          </div>
          <div>
            <p className="ds-para">
              <strong className="ds-strong">Followup Instructions:</strong>
            </p>
            <div
              className="ds-div"
              dangerouslySetInnerHTML={{
                __html: dischargeSummary.followUpInstructions || "N/A",
              }}
            />
          </div>
        </div>
        {/* <div>
          <p className="ds-para">
            <strong className="ds-strong">Followup Instructions:</strong>
          </p>
          <div
            className="ds-div"
            dangerouslySetInnerHTML={{
              __html: dischargeSummary.followUpInstructions || "N/A",
            }}
          />
        </div> */}
        <div>
          {/* <h3
            className="discharge-medications-header"
            style={{ textAlign: "left", marginBottom: "2px" }}
          >
            Medications
          </h3> */}
          <div>
            <div>
              <p className="ds-para">
                <strong className="ds-strong">Medications:</strong>
              </p>
              <div
                className="ds-div"
                dangerouslySetInnerHTML={{
                  __html: dischargeSummary.medications || "N/A",
                }}
              />
            </div>
            {/* <div className="ds-medications-list-text">
              {dischargeSummary?.medications} */}
            {/* {dischargeSummary?.medications?.length > 0 ? (
            dischargeSummary.medications.map((med, index) => (
              <p key={index} className="ds-medication-item">
                {med.name}, ({med.dosage}),  ({med.frequency})
              </p>
            ))
          ) : (
            <p>No medications assigned at discharge.</p>
          )} */}
            {/* </div> */}

            {/* Authorized Signatory Section */}
            <div
              className="unique-space-signature"
              style={{
                display: "flex",
                justifyContent: "end",
                marginTop: "40px",
              }}
            >
              <div className="unique-signature-section">
                <p style={{ color: "black", textAlign: "center" }}>
                  {dischargeSummary.dischargingDoctor?.name || "N/A"}
                </p>
                <p>
                  <strong style={{ color: "black" }}>
                    Authorized Signatory
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DischargeSummaryPrint;

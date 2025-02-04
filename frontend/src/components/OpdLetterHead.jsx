import React, { useEffect } from "react";
import prakashLogo from "../assets/prakashLogo.jpg";
import prakashLogoPng from "../assets/prakashLogoPng.png";

const OpdLetterHead = ({ printRef, patientDetails, doctorName }) => {

  return (
    <div className="ipd-bill-layout print-content print-only" ref={printRef}>
      {/* <div className="total-bill-image-container">
            <img src={hospitalImage} alt="Hospital" className="ds-hospital-image" />
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
      <hr />
      <div className="bill-head">
        <h3 className="sub-header">Patient Details</h3>
      </div>
      <div className="top-border">
        <div className="patient-details-container">
          {[
            {
              label: "Patient Name",
              value: patientDetails?.patientName?.toUpperCase() || "N/A",
            },
            {
              label: "UHID",
              value: patientDetails?.uhid || "N/A",
            },
            {
              label: "Mobile",
              value: patientDetails?.mobile || "N/A",
            },
            {
              label: "Age/Gender",
              value: `${patientDetails?.age || "N/A"}/${
                patientDetails?.gender || "N/A"
              }`,
            },

            patientDetails?.crnNumber?.trim() !== "" &&
            patientDetails?.crnNumber
              ? {
                  label: "CR Number",
                  value: patientDetails?.crnNumber || "N/A",
                }
              : null,
            patientDetails?.ummidCard?.trim() !== "" &&
            patientDetails?.ummidCard
              ? {
                  label: "UMMID Number",
                  value: patientDetails?.ummidCard || "N/A",
                }
              : null,
            {
              label: "Doctor",
              value: doctorName || "N/A",
            },
          ]
            .filter((detail) => detail !== null) // Remove null entries
            .map((detail, index) => (
              <div key={index} className="patient-detail">
                <div className="patient-label">{detail.label}:</div>
                <div className="patient-value">{detail.value}</div>
              </div>
            ))}
        </div>
      </div>
      {/* Additional Fields for Doctor to Write */}
      <div className="vitals-container">
        {["BP", "SPO2", "P/R", "Weight"].map((label, index) => (
          <div key={index} className="vital-detail">
            <div className="vital-label">{label}:</div>
            {/* <div className="vital-value">_________________</div>  */}
          </div>
        ))}
      </div>
      {/* Center Logo with Opacity and Design Pattern */}
      <div className="center-logo-container">
        <img
          src={prakashLogoPng}
          alt="Center Logo"
          className="center-logo"
        />
      </div>
      {/* Footer */}
      <div className="opd-letter-head-footer">
        <p>Thank you for choosing New Prakash Surgical Clinic.</p>
        <p>Address - infront of kauwabagh, police chowki,</p>
        <p>Bichhiya Railway Colony, Gorakhpur, Uttar Pradesh 273001</p>
        <p>Phone - 09415280491, 9115280491</p>
        <p>Email - prakashsurgicalgkp@gmail.com</p>
        {/* <p>Visit us - https://newprakashsurgicalclinic.com/</p> */}
      </div>
    </div>
  );
};

export default OpdLetterHead;

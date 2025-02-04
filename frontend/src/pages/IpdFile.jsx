import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import IpdSideNav from "../components/ipd/IpdSideNav";
import IpdProfile from "../components/ipd/IpdProfile";
import PhysicalExamination from "../components/ipd/PhysicalExamination";
import DischargeSummary from "../components/ipd/DischargeSummary";
import IpdComplaints from "../components/ipd/IpdComplaints";
import IpdVisitNotes from "../components/ipd/IpdVisitNotes";
import ObsGynae from "../components/ipd/ObsGynae";
import IpdConsumablesList from "../components/ipd/IpdConsumablesList";
import IpdChemoList from "../components/ipd/IpdChemoList";
import IpdAllergies from "../components/ipd/IpdAllergies";
import IpdInvestigations from "../components/ipd/IpdInvestigations";
import IpdWardHistory from "../components/ipd/IpdWardHistory";
import { environment } from "../../utlis/environment";
import Tabs from "../components/ipd/IpdBillPayment";

const IpdFile = () => {
  const nav = useNavigate();
  const { user, setNotification } = useContext(AppContext);
  const { admissionId } = useParams();
  const [billPaid, setBillPaid] = useState(false);

  useEffect(() => {
      document.title = "IPD File | HMS";
      if (
        !user ||
        (user.role !== "admin" &&
          user.role !== "counter" &&
          user.role !== "nurse")
      ) {
        setNotification("You are not authorised to access this page");
        nav("/");
      }
    }, [user, nav, setNotification]);

  useEffect(() => {
    remainingDues();
  }, []);

  const remainingDues = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/patient/remaining-dues?admissionId=${admissionId}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("payment type of patient -", data.patient.patientId.paymentType);
        // console.log("total remaining -", data.totalRemaining);
        setBillPaid((data.totalRemaining === 0 || data.patient?.patientId?.paymentType === "credit"));
      }
    } catch (error) {
      // console.log(error);
      setNotification("server error");
    }
  };

  return (
    <>
      <div className="full-opd-rx">
        <IpdSideNav />
        <div className="opd-rx-sideContent">
          <Routes>
            <Route path="" element={<IpdProfile admissionId={admissionId} />} />
            <Route
              path="physical-examination"
              element={<PhysicalExamination admissionId={admissionId} />}
            />
            <Route
              path="discharge-summary"
              element={
                <DischargeSummary
                  admissionId={admissionId}
                  billPaid={billPaid}
                />
              }
            />
            <Route
              path="investigations"
              element={<IpdInvestigations admissionId={admissionId} />}
            />
            <Route
              path="chief-complaints"
              element={<IpdComplaints admissionId={admissionId} />}
            />
            <Route
              path="chemo-notes"
              element={<IpdChemoList admissionId={admissionId} />}
            />
            <Route
              path="allergies"
              element={<IpdAllergies admissionId={admissionId} />}
            />
            <Route
              path="visit-notes"
              element={<IpdVisitNotes admissionId={admissionId} />}
            />
            <Route
              path="obs-gynae"
              element={<ObsGynae admissionId={admissionId} />}
            />
            <Route
              path="consumables"
              element={<IpdConsumablesList admissionId={admissionId} />}
            />
            <Route
              path="ward-history"
              element={<IpdWardHistory admissionId={admissionId} />}
            />
            <Route
              path="ipd-billing"
              element={<Tabs admissionId={admissionId} />}
            />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default IpdFile;

import React, { useContext, useEffect } from 'react';
import SideNav from '../components/SideNav';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import OpdProfile from '../components/opd/OpdProfile.jsx';
import OpdMedicineList from '../components/opd/OpdMedicineList.jsx';
import OpdAllergiesList from '../components/opd/OpdAllergiesList.jsx';
import OpdAssignedTests from '../components/opd/OpdAssignedTests.jsx';
import './styles/OpdRx.css';
import OpdAssessment from '../components/opd/OpdAssessment.jsx';
import { AppContext } from '../context/AppContext.jsx';
import OpdFollowups from '../components/opd/OpdFollowups.jsx';
import OpdBilling from '../components/opd/OpdBilling.jsx';

const OpdRx = () => {
  const {user,setNotification} = useContext(AppContext);
  const nav = useNavigate();
  const { opdRx } = useParams();

  useEffect(() => {
      document.title = "OPD RX | HMS";
      if (!user || (user.role !== "admin" && user.role !== "counter" && user.role !== "nurse")) {
        setNotification("You are not authorised to access this page");
        nav("/");
      }
    }, [user, nav, setNotification]);

  return (
    <>
      <div className="full-opd-rx">
        <SideNav />
        <div className="opd-rx-sideContent">
        <Routes>
          <Route path="" element={<OpdProfile opdId={opdRx} />} />
          <Route path="assign-medicine" element={<OpdMedicineList opdId={opdRx} />} />
          <Route path="add-allergy" element={<OpdAllergiesList opdId={opdRx} />} />
          <Route path="assign-test" element={<OpdAssignedTests opdId={opdRx} />} />
          <Route path="assessment" element={<OpdAssessment opdId={opdRx} />} />
          <Route path="billings" element={<OpdBilling opdId={opdRx} />} />
          <Route path="follow-up" element={<OpdFollowups opdId={opdRx} />} />
        </Routes>
        </div>
      </div>
    </>
  );
}

export default OpdRx;

import React, { useContext, useEffect } from 'react';
import SideNav from '../components/SideNav';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import OpdProfile from '../components/OpdProfile';
import AssignMedicine from '../components/AssignMedicine';
import AddAllergy from '../components/AddAllergy';
import AssignTests from '../components/AssignTests';
import './styles/opdRx.css';
import OpdAssessment from '../components/OpdAssessment';
import PaymentsHistory from '../components/PaymentsHistory';
import Followup from '../components/Followup';
import { AppContext } from '../context/AppContext.jsx';

const OpdRx = () => {
  const {user} = useContext(AppContext);
  const nav = useNavigate();
  const { opdRx } = useParams();

  useEffect(()=>{
    document.title = "OPD RX | HMS";
    if(!user){
      nav('/emp-login')
    }
  },[user])

  return (
    <>
      <div className="full-opd-rx">
        <SideNav />
        <div className="opd-rx-sideContent">
        <Routes>
          <Route path="" element={<OpdProfile opdId={opdRx} />} />
          <Route path="assign-medicine" element={<AssignMedicine opdId={opdRx} />} />
          <Route path="add-allergy" element={<AddAllergy opdId={opdRx} />} />
          <Route path="assign-test" element={<AssignTests opdId={opdRx} />} />
          <Route path="assessment" element={<OpdAssessment opdId={opdRx} />} />
          <Route path="payments" element={<PaymentsHistory opdId={opdRx} />} />
          <Route path="follow-up" element={<Followup opdId={opdRx} />} />
        </Routes>
        </div>
      </div>
    </>
  );
}

export default OpdRx;

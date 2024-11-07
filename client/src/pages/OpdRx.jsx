import React, { useEffect } from 'react';
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

const OpdRx = ({setNotification, user}) => {
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
        <SideNav opdId={opdRx} user={user}/>
        <div className="opd-rx-sideContent">
        <Routes>
          <Route path="" element={<OpdProfile opdId={opdRx} setNotification={setNotification} />} />
          <Route path="assign-medicine" element={<AssignMedicine opdId={opdRx} setNotification={setNotification}/>} />
          <Route path="add-allergy" element={<AddAllergy opdId={opdRx} setNotification={setNotification}/>} />
          <Route path="assign-test" element={<AssignTests opdId={opdRx} setNotification={setNotification}/>} />
          <Route path="assessment" element={<OpdAssessment opdId={opdRx} setNotification={setNotification}/>} />
          <Route path="payments" element={<PaymentsHistory opdId={opdRx} setNotification={setNotification}/>} />
          <Route path="follow-up" element={<Followup opdId={opdRx} setNotification={setNotification}/>} />
          {/*
          <Route path="diagnosis" element={<Diagnosis />} />
          <Route path="treatment" element={<Treatment />} />
           */}
        </Routes>
        </div>
      </div>
    </>
  );
}

export default OpdRx;

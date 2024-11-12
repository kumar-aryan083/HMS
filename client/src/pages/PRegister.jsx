import React, { useContext, useEffect } from 'react';
import PatientRegistration from '../components/PatientRegistration';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const PRegister = () => {
  const {user} = useContext(AppContext);
  const nav = useNavigate();

  useEffect(()=>{
    document.title = "Patient Registration | HMS"
    if(!user){
      nav('/emp-login')
    }
  },[user])

  return (
    <> 
      <PatientRegistration />
    </>
  );
}

export default PRegister;

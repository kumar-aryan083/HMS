import React, { useEffect } from 'react';
import PatientRegistration from '../components/PatientRegistration';
import { useNavigate } from 'react-router-dom';

const PRegister = ({user, setNotification}) => {
  const nav = useNavigate();

  useEffect(()=>{
    document.title = "Patient Registration | HMS"
    if(!user){
      nav('/emp-login')
    }
  },[user])

  return (
    <> 
      <PatientRegistration setNotification={setNotification} />
    </>
  );
}

export default PRegister;

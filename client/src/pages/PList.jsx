import React, { useEffect } from 'react';
import PatientList from '../components/PatientList';
import { useNavigate } from 'react-router-dom';

const PList = ({setNotification, user}) => {
  const nav = useNavigate();
  useEffect(()=>{
    if(!user){
      nav('/emp-login');
    }
  },[user])
  return (
    <>
      <PatientList setNotification={setNotification} />
    </>
  );
}

export default PList;

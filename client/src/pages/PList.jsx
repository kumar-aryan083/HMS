import React, { useContext, useEffect } from 'react';
import PatientList from '../components/PatientList';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const PList = () => {
  const {user} = useContext(AppContext);
  const nav = useNavigate();
  useEffect(()=>{
    if(!user){
      nav('/emp-login');
    }
  },[user])
  return (
    <>
      <PatientList  />
    </>
  );
}

export default PList;

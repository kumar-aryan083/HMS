import React, { useEffect, useState } from 'react';
import Register from '../components/Register';
import { useNavigate } from 'react-router-dom';

const EmpRegister = ({
  setNotification,
  newUser,
  user
}) => {
  const nav = useNavigate();
  
  useEffect(() => {
    document.title = 'Employee Register | HMS'
    if(user){
      nav('/');
    }
  }, [user])

  if(!user){
    return (
      <>
        <Register newUser={newUser} setNotification={setNotification} />
      </>
    );
  }
}

export default EmpRegister;

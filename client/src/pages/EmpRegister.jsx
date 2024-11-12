import React, { useContext, useEffect, useState } from 'react';
import Register from '../components/Register';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const EmpRegister = () => {
  const {setNotification, newUser, user} = useContext(AppContext);

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

import React, { useEffect } from 'react';
import {useNavigate} from 'react-router-dom'

const Accounts = ({setNotification, user}) => {
  const nav = useNavigate();
  
  useEffect(()=>{
    if(!user){
      nav('/emp-login');
    }
  },[user])

  return (
    <>
      Accounts page
    </>
  );
}

export default Accounts;

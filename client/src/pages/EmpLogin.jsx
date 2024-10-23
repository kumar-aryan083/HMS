import React, { useEffect } from 'react';
import Login from '../components/Login';
import { useNavigate } from 'react-router-dom';

const EmpLogin = ({user, setNotification, newUser}) => {
    const nav = useNavigate();
  
    useEffect(() => {
      document.title = 'Employee Login | HMS'
      if(user){
        nav('/');
      }
    }, [user])
  
    if(!user){
      return (
        <>
          <Login newUser={newUser} setNotification={setNotification} />
        </>
      );
    }
}

export default EmpLogin;

import React, { useContext, useEffect } from 'react';
import Login from '../components/Login';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const EmpLogin = () => {
  
    const {user, setNotification, newUser} = useContext(AppContext);
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

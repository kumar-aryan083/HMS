import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
import EmpRegister from './pages/EmpRegister';
import EmpLogin from './pages/EmpLogin';
import PRegister from './pages/PRegister';
import PList from './pages/PList';
import EditPatient from './components/EditPatient';

const App = () => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u?JSON.parse(u):null
  })
  const [message, setMessage] = useState('');
  const setNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 2000);
  }
  const newUser = (currUser) => {
    // console.log(currUser);
    setUser(currUser);
    const u = JSON.stringify(currUser);
    localStorage.setItem('user', u);
  }
  return (
    <>
      <Navbar message={message} user ={user} newUser={newUser}/>
      <main className="fullBody">
        <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/emp-register' element={<EmpRegister setNotification={setNotification} newUser = {newUser} user={user}/>} />
          <Route path='/emp-login' element={<EmpLogin setNotification={setNotification} newUser = {newUser} user={user}/>} />
          <Route path='/patient-register' element={<PRegister user={user} setNotification={setNotification} />} />
          <Route path='/patient-list' element={<PList setNotification={setNotification} />} />
          <Route path='/edit-patient/:uhid' element={<EditPatient setNotification={setNotification} user={user} />} />
        </Routes>
      </main>
      <footer className="footerMain">
        <Footer/>
      </footer>
    </>
  );
}

export default App;

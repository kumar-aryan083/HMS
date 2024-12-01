import React, { useContext, useState } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
import EmpRegister from './pages/EmpRegister';
import EmpLogin from './pages/EmpLogin';
import PRegister from './pages/PRegister';
import PList from './pages/PList';
import EditPatient from './components/EditPatient';
import AdminLogin from './components/AdminLogin';
import AddDoctor from './components/AddDoctor';
import AddDepartment from './components/AddDepartment';
import Appointment from './components/Appointment';
import OpdForm from './components/OpdForm';
import OpdFile from './components/OpdFile';
import OpdRx from './pages/OpdRx';
import Accounts from './pages/Accounts';
import IpdSettings from './pages/IpdSettings';
import { AppContext } from './context/AppContext.jsx';
import PatientAdmissionForm from './components/PatientAdmissionForm.jsx';
import AllIpds from './components/AllIpds.jsx';
import IpdFile from './pages/IpdFile.jsx';


const App = () => {
  const {user, setNotification} = useContext(AppContext);
  
  return (
    <>
      <Navbar />
      <main className="fullBody">
        <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/emp-register' element={<EmpRegister />} />
          <Route path='/emp-login' element={<EmpLogin />} />
          <Route path='/admin-login' element={<AdminLogin />} />
          <Route path='/patient-register' element={<PRegister />} />
          <Route path='/patient-list' element={<PList />} />
          <Route path='/edit-patient/:uhid' element={<EditPatient />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/add-department' element={<AddDepartment />} />
          <Route path='/appointments' element={<Appointment />} />
          <Route path='/opd' element={<OpdForm />} />
          <Route path='/opd-files' element={<OpdFile />} />
          <Route path='/opd/:opdRx/*' element={<OpdRx setNotification={setNotification}/>} />
          <Route path='/accounts' element={<Accounts setNotification={setNotification} user={user} />} />
          <Route path='/ipd/ipd-setting' element={<IpdSettings />} />
          <Route path='/ipd/admit-patient' element={<PatientAdmissionForm />} />
          <Route path='/ipd/all-ipds' element={<AllIpds />} />
          <Route path='/ipds/ipd-file/:admissionId/*' element={<IpdFile />} />
        </Routes>
      </main>
      <footer className="footerMain">
        <Footer/>
      </footer>
    </>
  );
}

export default App;

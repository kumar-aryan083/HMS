import React, { useContext } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
import PRegister from './pages/PRegister';
import PList from './pages/PList';
import EditPatient from './components/EditPatient';
import OpdForm from './components/opd/OpdForm.jsx';
import OpdFile from './components/opd/OpdFile.jsx';
import OpdRx from './pages/OpdRx';
import Accounts from './pages/Accounts';
import IpdSettings from './pages/IpdSettings';
import { AppContext } from './context/AppContext.jsx';
import PatientAdmissionForm from './components/PatientAdmissionForm.jsx';
import AllIpds from './components/ipd/AllIpds.jsx';
import IpdFile from './pages/IpdFile.jsx';
import Login from './components/Login.jsx';
import PharmacySetting from './pages/PharmacySetting.jsx';
import LabSetting from './pages/LabSetting.jsx';
import AppointmentsList from './components/AppointmentsList.jsx';
import StoreSetting from './pages/StoreSetting.jsx';
import DoctorsList from './components/DoctorsList.jsx';
import DepartmentList from './components/DepartmentList.jsx';
import StaffList from './components/StaffList.jsx';
import IpdStatistics from './components/ipd/IpdStatistics.jsx';
import OpdStatistics from './components/opd/OpdStatistics.jsx';
import IpdReports from './components/ipd/IpdReports.jsx';
import AccountsExpenses from './components/accounts/AccountsExpenses.jsx';
import CashHandoverReport from './components/CashHandoverReport.jsx';
import AdditionalServiceMain from './components/AdditionalServiceMain.jsx';
import StaffManagement from './pages/StaffManagement.jsx';
import Agents from './components/Agents.jsx';
import OpdRate from './components/ipd/OpdRate.jsx';


const App = () => {
  const {user, setNotification} = useContext(AppContext);
  
  return (
    <>
      <Navbar />
      <main className="fullBody">
        <Routes>
          
        <Route path='/' element={<Home />} />
        {/* <Route path='/login' element={<LoginOptions />} /> */}
          {/* <Route path='/staff-register' element={<Register />} /> */}
          <Route path='/staff-list' element={<StaffList />} />
          <Route path='/login' element={<Login />} />
          {/* <Route path='/emp-login' element={<EmpLogin />} /> */}
          <Route path='/patient-register' element={<PRegister />} />
          <Route path='/patient-list' element={<PList />} />
          <Route path='/edit-patient/:uhid' element={<EditPatient />} />
          {/* <Route path='/add-doctor' element={<AddDoctor />} /> */}
          <Route path='/doctor-list' element={<DoctorsList />} />
          {/* <Route path='/add-department' element={<AddDepartment />} /> */}
          <Route path='/department-list' element={<DepartmentList />} />
          {/* <Route path='/appointments' element={<Appointment />} /> */}
          <Route path='/appointments-list' element={<AppointmentsList />} />
          <Route path='/opd' element={<OpdForm />} />
          <Route path='/opd/opd-rate' element={<OpdRate />} />
          <Route path='/opd-files' element={<OpdFile />} />
          <Route path='/opd/opd-stats' element={<OpdStatistics />} />
          <Route path='/opd/:opdRx/*' element={<OpdRx setNotification={setNotification}/>} />
          <Route path='/ipd/ipd-setting' element={<IpdSettings />} />
          <Route path='/ipd/admit-patient' element={<PatientAdmissionForm />} />
          <Route path='/ipd/all-ipds' element={<AllIpds />} />
          <Route path='/ipd/ipd-stats' element={<IpdStatistics />} />
          <Route path='/ipd/ipd-reports' element={<IpdReports />} />
          <Route path='/ipds/ipd-file/:admissionId/*' element={<IpdFile />} />
          <Route path='/lab-setting/*' element={<LabSetting />} />
          <Route path='/pharmacy-setting/*' element={<PharmacySetting />} />
          <Route path='/store/*' element={<StoreSetting />} />
          <Route path='/accounts/*' element={<Accounts setNotification={setNotification} user={user} />} />
          <Route path='/expenses' element={<AccountsExpenses setNotification={setNotification} user={user} />} />
          <Route path='/cash-handover-report' element={<CashHandoverReport />} />
          <Route path='/additional-services/*' element={<AdditionalServiceMain />} />
          <Route path='/staff-management/*' element={<StaffManagement />} />
          <Route path='/agents' element={<Agents />} />
          {/* <Route path='/opd-letter-head' element={<OpdLetterHead />} /> */}

        </Routes>
      </main>
      <footer className="footerMain">
        <Footer/>
      </footer>
    </>
  );
}

export default App;

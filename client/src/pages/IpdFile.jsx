import React, { useContext, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import IpdSideNav from '../components/IpdSideNav';
import IpdProfile from '../components/IpdProfile';
import PhysicalExamination from '../components/PhysicalExamination';
import DischargeSummary from '../components/DischargeSummary';
import Invesitgations from '../components/Invesitgations';
import ChiefComplaints from '../components/ChiefComplaints';
import ChemoNotes from '../components/ChemoNotes';
import Allergies from '../components/Allergies';
import VisitNotes from '../components/VisitNotes';
import ObsGynae from '../components/ObsGynae';

const IpdFile = () => {
    const {admissionId} = useParams();
    const {user} = useContext(AppContext);

    useEffect(()=>{
        document.title = "IPD File | HMS";
        if(!user){
          nav('/emp-login')
        }
      },[user])

  return (
    <>
    <div className="full-opd-rx">
        <IpdSideNav />
        <div className="opd-rx-sideContent">
        <Routes>
          <Route path="" element={<IpdProfile admissionId={admissionId} />} />
          <Route path="physical-examination" element={<PhysicalExamination admissionId={admissionId} />} />
          <Route path="discharge-summary" element={<DischargeSummary admissionId={admissionId} />} />
          <Route path="investigations" element={<Invesitgations admissionId={admissionId} />} />
          <Route path="chief-complaints" element={<ChiefComplaints admissionId={admissionId} />} />
          <Route path="chemo-notes" element={<ChemoNotes admissionId={admissionId} />} />
          <Route path="allergies" element={<Allergies admissionId={admissionId} />} />
          <Route path="visit-notes" element={<VisitNotes admissionId={admissionId} />} />
          <Route path="obs-gynae" element={<ObsGynae admissionId={admissionId} />} />
        </Routes>
        </div>
      </div>
    </>
  );
}

export default IpdFile;

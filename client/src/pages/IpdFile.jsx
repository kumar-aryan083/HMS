import React, { useContext, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import IpdSideNav from '../components/IpdSideNav';
import IpdProfile from '../components/IpdProfile';

const IpdFile = () => {
    const {uhid} = useParams();
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
          <Route path="" element={<IpdProfile uhid={uhid} />} />
        </Routes>
        </div>
      </div>
    </>
  );
}

export default IpdFile;

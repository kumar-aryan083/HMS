import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wings from '../components/Wings';
import VisitingDoctors from '../components/VisitingDoctors';
import Rooms from '../components/Rooms';
import NursingRates from '../components/NursingRates';
import './styles/IpdSetting.css';
import { AppContext } from '../context/AppContext.jsx';

const IpdSettings = () => {
  const {user} = useContext(AppContext);
    const nav = useNavigate();
    const [activeTab, setActiveTab] = useState('wings');

    useEffect(()=>{
        document.title = "IPD Settings | HMS"
        if(!user){
            nav('/emp-login');
        }
    },[user]);

    const renderContent = ()=>{
        switch(activeTab){
            case 'wings':
                return <Wings />;
            case 'rooms':
                return <Rooms />;
            case 'visitingDoctor':
                return <VisitingDoctors />;
            case 'nursingRates':
                return <NursingRates />
            default:
                return null;
        }
    }

  return (
    <>
    <div className="upper-is">
      <div className="tab-menu">
        <button onClick={()=> setActiveTab('wings')} className={activeTab === 'wings' ? 'active' : ''}>Wings</button>
        <button onClick={()=> setActiveTab('rooms')} className={activeTab === 'rooms' ? 'active' : ''}>Rooms</button>
        <button onClick={()=> setActiveTab('visitingDoctor')} className={activeTab === 'visitingDoctor' ? 'active' : ''}>Visiting Doctor</button>
        <button onClick={()=> setActiveTab('nursingRates')} className={activeTab === 'nursingRates' ? 'active' : ''}>Nursing Rates</button>
      </div>
    </div>
    <div className="lower-is">
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
    </>
  );
}

export default IpdSettings;

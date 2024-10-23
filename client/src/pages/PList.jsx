import React from 'react';
import PatientList from '../components/PatientList';

const PList = ({setNotification}) => {
  return (
    <>
      <PatientList setNotification={setNotification} />
    </>
  );
}

export default PList;

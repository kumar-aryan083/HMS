import React, { useContext, useState } from 'react';
import './styles/ChemoNotes.css';
import { AppContext } from '../context/AppContext';

const ChemoNotes = ({admissionId}) => {
  const {setNotification} = useContext(AppContext);
  const [chemoDetails, setChemoDetails] = useState({
    cycles: '',
    regimen: '',
    sideEffects: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setChemoDetails({ ...chemoDetails, [name]: value });
  };

  const addChemo = async(e)=>{
    e.preventDefault();
    console.log(chemoDetails);
    try {
      const res = await fetch(`http://localhost:8000/api/ipd/${admissionId}/chemo-notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(chemoDetails)
      });
      const data = await res.json();
      if(res.ok){
        setChemoDetails({
          cycles: '',
          regimen: '',
          sideEffects: '',
        })
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="chemo-notes-container">
      <h2>Chemo Notes</h2>
      <form onSubmit={addChemo} className="chemo-form">
        <label>Number of Cycles:</label>
        <input
          type="number"
          name="cycles"
          value={chemoDetails.cycles}
          onChange={handleChange}
          className="chemo-input"
        />

        <label>Regimen:</label>
        <input
          type="text"
          name="regimen"
          value={chemoDetails.regimen}
          onChange={handleChange}
          className="chemo-input"
        />

        <label>Side Effects:</label>
        <textarea
          name="sideEffects"
          value={chemoDetails.sideEffects}
          onChange={handleChange}
          className="chemo-textarea"
        ></textarea>
        <button type='submit'>Add Chemo Notes</button>
      </form>
    </div>
  );
};

export default ChemoNotes;

import React, { useContext, useEffect, useState } from "react";
import "./styles/Wings.css";
import WingModal from "./WingModal";
import { AppContext } from "../context/AppContext.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const Wings = () => {
  const {setNotification} = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wings, setWings] = useState([]);

  useEffect(()=>{
    fetchWings();
  },[]);

  const fetchWings = async()=>{
    try {
      const res = await fetch("http://localhost:8000/api/ipd/get-wings",{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if(res.ok){
        console.log(data.wings);
        setWings(data.wings);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleAddWing = async(wing) => {
    console.log(wing);
    try {
      const res = await fetch("http://localhost:8000/api/ipd/create-wing",{
        method: "POST",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(wing)
      });
      const data = await res.json();
      if(res.ok){
        setNotification(data.message);
        setIsModalOpen(false);
        setWings((prevWings)=> [...prevWings, data.newWing]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleEditWing = (wingId)=>{
    console.log(wingId);
  }
  const handleDeleteWing = (wingId)=>{
    console.log(wingId);
  }

  return (
    <>
      <div className="upper-wing">
        <h2>Wings</h2>
        <button onClick={() => setIsModalOpen(true)}>Add Wing</button>
      </div>
      <div className="lower-wing">
        <table className="wing-table">
          <thead>
            <tr>
              <th>Name</th>
              <th className="wings-rooms">Number of Rooms</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wings.length>0 ? (
              wings.map((wing)=>(
                <tr key={wing._id}>
                  <td>{wing.name}</td> 
                  <td className="wings-rooms">{wing.rooms.length}</td> 
                  <td>{wing.description}</td> 
                  <td className="wing-btn">
                  <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEditWing(wing._id)}
                      title="Edit"
                      className="icon"
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      onClick={() => handleDeleteWing(wing._id)}
                      title="Delete"
                      className="icon"
                    />
                  </td>
                </tr>
              ))
            ):(
              <p>No Wings Avaliable to show</p>
            )}
          </tbody>
        </table>
      </div>
      <WingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWing={handleAddWing}
      />
    </>
  );
};

export default Wings;

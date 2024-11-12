import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/Wings.css";
import WingModal from "./WingModal";
import { AppContext } from "../context/AppContext.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const Wings = () => {
  const {setNotification} = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wings, setWings] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: ""
  })
  const [id, setId] = useState("");

  const editRef = useRef();

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
        // console.log(data.wings);
        setWings(data.wings);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleAddWing = async(wing) => {
    // console.log(wing);
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

  const handleEditSubmit = async(e)=>{
    e.preventDefault();
    console.log(form);
    try {
      const res = await fetch(`http://localhost:8000/api/ipd/edit-wing/${id}`,{
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if(res.ok){
        setWings((prevWing)=> prevWing.map((wing)=> wing._id === id ? data.updatedWing : wing));
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  }
  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleEditing = (wing)=>{
    editRef.current.style.display = 'flex';
    setId(wing._id);
    setForm({
      name: wing.name,
      description: wing.description
    });
  }

  const handleDeleteWing = async(wingId)=>{
    // console.log(wingId);
    try {
      const res = await fetch(`http://localhost:8000/api/ipd/delete-wing/${wingId}`,{
        method: "DELETE",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if(res.ok){
        setNotification(data.message);
        setWings((prevWings)=> prevWings.filter((wing) => wing._id !== data.deletedWing._id));
      }
    } catch (error) {
      console.log(error);
    }
  }
  const handleClose = ()=>{
    editRef.current.style.display = 'none';
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
                      onClick={() => handleEditing(wing)}
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
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No Wings Available to Show
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <WingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWing={handleAddWing}
      />

      <div className="edit-wing" ref={editRef}>
      <div className="modal-content">
      <button type="button" onClick={handleClose} className='closeBtn'>X</button> 
        <h3>Update Wing</h3>
        <form onSubmit={handleEditSubmit}>
          <label>
            Wing Name:
            <input type="text" name="name" onChange={handleChange} value={form.name} required />
          </label>
          <label>
            Description:
            <textarea type="text" name="description" rows={10} onChange={handleChange} value={form.description} required />
          </label>
          <button type="submit">Update Wing</button>
        </form>
      </div>
    </div>
    </>
  );
};

export default Wings;

import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";
import NursingModal from "./NursingModal";

const NursingRates = () => {
  const { setNotification } = useContext(AppContext);
  const [nurses, setNurses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    perUnitPrice: "",
    gender: ""
  });

  const editRef = useRef();

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/ipd/get-nursing", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data.nurses);
        setNurses(data.nurses);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddNurse = async (nurse) => {
    // console.log(nurse);
    try {
      const res = await fetch("http://localhost:8000/api/ipd/add-nursing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(nurse),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setNurses((prevNurses) => [...prevNurses, data.nurse]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteNurse = async (nurseId) => {
    // console.log(nurseId);
    try {
      const res = await fetch(
        `http://localhost:8000/api/ipd/delete-nursing/${nurseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setNurses((prevNurses) =>
          prevNurses.filter((nurse) => nurse._id !== data.deletedNurse._id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditing = (nurse) => {
    // console.log(nurse);
    editRef.current.style.display = "flex";
    setId(nurse._id);
    setForm({
      name: nurse.name,
      phone: nurse.phone,
      gender: nurse.gender,
      perUnitPrice: nurse.perUnitPrice,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(`http://localhost:8000/api/ipd/edit-nursing/${id}`,{
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if(res.ok){
        setNurses((preNurses)=> preNurses.map((nurse)=> nurse._id === id ? data.updatedNurse : nurse));
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="upper-wing">
        <h2>Nursing Rates</h2>
        <button onClick={() => setIsModalOpen(true)}>Add Nursing</button>
      </div>
      <div className="lower-wing">
        <table className="wing-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Phone</th>
              <th>Per unit price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nurses.length > 0 ? (
              nurses.map((nurse) => (
                <tr key={nurse._id}>
                  <td>{nurse.name}</td>
                  <td>{nurse.phone}</td>
                  <td>{nurse.perUnitPrice}</td>
                  <td className="wing-btn">
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEditing(nurse)}
                      title="Edit"
                      className="icon"
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      onClick={() => handleDeleteNurse(nurse._id)}
                      title="Delete"
                      className="icon"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No Wings Available to Show
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NursingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddNurse={handleAddNurse}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="closeBtn">
            X
          </button>
          <h3>Edit Nursing Item</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="input-pair vd-inpt">
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                  required
                />
              </label>
              <label>
                Phone:
                <input
                  type="text"
                  name="phone"
                  onChange={handleChange}
                  value={form.phone}
                  required
                />
              </label>
            </div>
            <div className="input-pair">
              <label>
                Gender:
                <select
                  name="gender"
                  onChange={handleChange}
                  value={form.gender}
                  className="vd-dropdown"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Per Unit Price:
                <input
                  type="text"
                  name="perUnitPrice"
                  onChange={handleChange}
                  value={form.perUnitPrice}
                  required
                />
              </label>
            </div>

            <button type="submit">Update Nursing Item</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NursingRates;

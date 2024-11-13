import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import VisitingDoctorModal from "./VisitingDoctorModal";
import { AppContext } from "../context/AppContext";

const VisitingDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setNotification } = useContext(AppContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    visitFees: "",
  });
  const [id, setId] = useState("");

  const editRef = useRef();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/ipd/get-visitingDoctors",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data.doctors);
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    try {
      const res = await fetch(`http://localhost:8000/api/ipd/edit-visitingDoctor/${id}`,{
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if(res.ok){
        setDoctors((prevDoctors)=> prevDoctors.map((doctor)=> doctor._id === id ? data.updatedDoctor : doctor));
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleEditing = (doctor) => {
    // console.log(doctor);
    editRef.current.style.display = "flex";
    setId(doctor._id);
    setForm({
      name: doctor.name,
      phone: doctor.phone,
      email: doctor.email,
      specialization: doctor.specialization,
      visitFees: doctor.visitFees,
    });
  };

  const handleDeleteDoctor = async (doctorId) => {
    // console.log(doctorId);
    try {
      const res = await fetch(
        `http://localhost:8000/api/ipd/delete-visitingDoctor/${doctorId}`,
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
        setDoctors((prevDoctors) =>
          prevDoctors.filter((doctor) => doctor._id !== data.deletedDoctor._id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddDoctor = async (doctor) => {
    // console.log(doctor);
    try {
      const res = await fetch(
        "http://localhost:8000/api/ipd/add-visitingDoctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(doctor),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setIsModalOpen(false);
        setDoctors((prevDoctors) => [...prevDoctors, data.doctor]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="upper-wing">
        <h2>Visiting Doctors</h2>
        <button onClick={() => setIsModalOpen(true)}>
          Add Visiting Doctors
        </button>
      </div>
      <div className="lower-wing">
        <table className="wing-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Phone</th>
              <th>Speciality</th>
              <th>Visit Fees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.visitFees}</td>
                  <td className="wing-btn">
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEditing(doctor)}
                      title="Edit"
                      className="icon"
                    />
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      onClick={() => handleDeleteDoctor(doctor._id)}
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

      <VisitingDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDoctor={handleAddDoctor}
      />

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content">
          <button type="button" onClick={handleClose} className="closeBtn">
            X
          </button>
          <h3>Update Visiting Doctor</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="input-pair">
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

            <label>
              Email:
              <input
                type="text"
                name="email"
                onChange={handleChange}
                value={form.email}
                className="vd-email"
                required
              />
            </label>

            <div className="input-pair">
              <label>
                Speciality:
                <select
                  name="specialization"
                  onChange={handleChange}
                  value={form.specialization}
                  className="vd-dropdown"
                  required
                >
                  <option value="">Select Room Type</option>
                  <option value="ENT">ENT</option>
                  <option value="Physician">Physician</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Psychiatry">Psychiatry</option>
                </select>
              </label>
              <label>
                Visit Fees:
                <input
                  type="text"
                  name="visitFees"
                  onChange={handleChange}
                  value={form.visitFees}
                  required
                />
              </label>
            </div>

            <button type="submit">Update Visiting Doctor</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default VisitingDoctors;

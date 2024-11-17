import React, { useContext, useEffect, useState } from 'react';
import './styles/PatientList.css';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const PatientList = () => {
    const {setNotification} = useContext(AppContext);
    const nav = useNavigate();
    const [patients, setPatients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(''); // New state for 'from' date
    const [toDate, setToDate] = useState(''); // New state for 'to' date
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        document.title = "Patients List | HMS";
        fetchDetails();
    }, []);
    

    const fetchDetails = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/patient/patients-list?name=${searchTerm}&fromDate=${fromDate}&toDate=${toDate}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token")
                }
            });
            const data = await res.json();
            if (res.ok) {
                setPatients(data.patientDetails);
                setFilteredPatients(data.patientDetails);
            } else {
                setNotification(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Handle search
    const handleSearch = () => {
        let matchedPatients = patients;

        // Filter by name or phone number
        if (searchTerm.trim() !== '') {
            matchedPatients = matchedPatients.filter(patient =>
                patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.mobile.includes(searchTerm) // Check if phone number matches the search term
            );
        }

        // Filter by date range if selected
        if (fromDate && toDate) {
            matchedPatients = matchedPatients.filter(patient => {
                const registrationDate = new Date(patient.createdAt).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
                return registrationDate >= fromDate && registrationDate <= toDate;
            });
        }

        setFilteredPatients(matchedPatients);
        setCurrentPage(1);// Reset to the first page of filtered results
    };

    // Get current patients based on the search results
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

    // Calculate total pages based on filtered or total patients
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

    return (
        <>
            <div className="patient-list-container">
                <h2 className="patient-list-heading">Patients List</h2>
                {/* Search Input */}
                <div className="search-container">
                    <div className="search-inpts">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Patient Name or Mobile number"
                            className="search-input"
                        />
                        <button onClick={handleSearch} className="search-btn">Search</button>
                    </div>
                    <div className="search-inpts">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="date-input"
                            placeholder="From Date"
                        />
                        <span className='si-span'>to</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="date-input"
                            placeholder="To Date"
                        />
                        <button onClick={handleSearch} className="search-btn">Search by Date Range</button>
                    </div>
                </div>
                <table className="patient-list-table">
                    <thead>
                        <tr className="patient-list-header">
                            <th className="header-item uhid-item">UHID</th>
                            <th className="header-item name-item">Patient Name</th>
                            <th className="header-item age-item">Age/Sex</th>
                            <th className="header-item address-item">Address</th>
                            <th className="header-item phone-item">Phone</th>
                            <th className="header-item">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPatients.map(patient => (
                            <tr key={patient._id} className="patient-list-row">
                                <td className="row-item uhid-item">{patient.uhid}</td>
                                <td className="row-item name-item">{patient.patientName}</td>
                                <td className="row-item age-item">{patient.age}/{patient.gender.charAt(0).toUpperCase()}</td>
                                <td className="row-item address-item">{patient.firstAddress}</td>
                                <td className="row-item phone-item">{patient.mobile}</td>
                                <td className="row-item t-btn">
                                    <div className='pl-btn'>
                                        <div className="edit-btn" onClick={()=>(nav(`/edit-patient/${patient.uhid}`))}>Edit</div>
                                        <div className="delete-btn" onClick={async () => {
                                            const res = await fetch(`http://localhost:8000/api/patient/delete-patient/${patient._id}`, {
                                                method: "DELETE",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    token: localStorage.getItem('token')
                                                }
                                            })
                                            const data = await res.json();
                                            if (res.ok) {
                                                setPatients(prevPatients => prevPatients.filter(patient => patient._id !== data.deleted._id));
                                                setFilteredPatients(prevPatients => prevPatients.filter(patient => patient._id !== data.deleted._id));
                                                setNotification(data.message);
                                            }
                                        }}>Delete</div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

export default PatientList;

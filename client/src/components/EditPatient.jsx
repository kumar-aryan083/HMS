import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditPatient = ({setNotification, user}) => {
    const nav = useNavigate();
    const { uhid } = useParams()
    const [formData, setFormData] = useState({
        patientName: '',
        email: '',
        gender: '',
        aadhar: '',
        height: '',
        weight: '',
        mobile: '',
        firstAddress: '',
        secondAddress: '',
        state: '',
        district: '',
        country: '',
        pincode: '',
        bloodGroup: '',
        doctor: '',
        patientImg: '',
        age: '',
        birthday: '',
        insuranceProvider: '',
        insuranceName: '',
        cardNumber: '',
        insuranceNumber: '',
        facilityCode: '',
        initialBalance: '',
        guarantorName: '',
        guarantorMobile: '',
        guarantorRelationship: '',
        gurantorGender: '',
        salutation: '',
        maritalStatus: '',
        occupation: '',
        emgContact: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!user){
            nav('/emp-login');
        }
        fetchPatientData(); // Fetch patient data on component load
    }, [user]);

    const fetchPatientData = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/patient/get-patient/${uhid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    token: localStorage.getItem('token'),
                },
            });
            const data = await res.json();
            if (res.ok) {
                console.log(data);
                setFormData(data.patientDetails); // Set form fields with fetched patient data
                setLoading(false);
            } else {
                setNotification(data.message);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Function to calculate age
    const calculateAge = (birthday) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleBirthdayChange = (e) => {
        const birthday = e.target.value;
        const age = calculateAge(birthday);
        setFormData({
            ...formData,
            birthday,
            age: age >= 0 ? age : '' // Set age only if valid
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8000/api/patient/update-patient/${uhid}`,{
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if(res.ok){
                setNotification(data.message);
                nav('/patient-list');
            }else{
                setNotification(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Conditionally render the form when data is loaded
    if (loading) {
        return <div>Loading...</div>;
    }

  return (
    <>
      <div className="form-container">
            <h2>Update Patient</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-headline">
                    <p>Basic Information</p>
                    <div className='headline-line'></div>
                </div>

                <div className="form-group inline">
                    <div className="form-group salutation">
                        <label>Salutation <span className="required">*</span></label>
                        <select name="salutation" value={formData.salutation || ''} onChange={handleChange} required>
                            <option value="">Select</option>
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Dr">Dr</option>
                            <option value="Ms">Ms</option>
                            {/* Add more salutations as needed */}
                        </select>
                    </div>
                    <div className="inline-item">
                        <label>Full Name <span className="required">*</span></label>

                        <input
                            type="text"
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="inline-item">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Gender <span className="required">*</span></label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="inline-item">
                        <label>Aadhar Number <span className="required">*</span></label>
                        <input
                            type="number"
                            name="aadhar"
                            value={formData.aadhar}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="inline-item">
                        <label>Mobile Number <span className="required">*</span></label>
                        <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Birthday <span className="required">*</span></label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleBirthdayChange}
                            required
                        />
                    </div>
                    <div className="inline-item">
                        <label>Age <span className="required">*</span></label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            required
                            readOnly
                        />
                    </div>
                    <div className="inline-item">
                        <label>Blood Group <span className="required">*</span></label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                            <option value="">Select</option>
                            <option value="B+">B+</option>
                            <option value="AB-">AB-</option>
                            <option value="AB+">AB+</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="A-">A-</option>
                            <option value="A+">A+</option>
                        </select>
                    </div>
                    <div className="inline-item">
                        <label>Height (in cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="inline-item">
                        <label>Weight (in kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className='inline-item'>
                        <label>
                            Marital Status
                        </label>
                        <select
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            {/* Add more options if needed */}
                        </select>
                    </div>
                    <div className="inline-item">
                        <label>Occupation</label>
                        <input
                            type="text"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="inline-item">
                        <label>Emergency Contact No. <span className="required">*</span></label>
                        <input
                            type="number"
                            name="emgContact"
                            value={formData.emgContact}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-headline">
                    <p>Address Details</p>
                    <div className='headline-line'></div>
                </div>

                <div className="form-group">
                    <label>Address Line 1 <span className="required">*</span></label>
                    <input
                        type="text"
                        name="firstAddress"
                        value={formData.firstAddress}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Address Line 2</label>
                    <input
                        type="text"
                        name="secondAddress"
                        value={formData.secondAddress}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>State <span className="required">*</span></label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="inline-item">
                        <label>District <span className="required">*</span></label>
                        <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Country <span className="required">*</span></label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="inline-item">
                        <label>Pincode <span className="required">*</span></label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-headline">
                    <p>Additional Details</p>
                    <div className='headline-line'></div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Doctor</label>
                        <input
                            type="text"
                            name="doctor"
                            value={formData.doctor}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="inline-item">
                        <label>Patient Image</label>
                        <input
                            type="file"
                            name="patientImg"
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Guarantor Name</label>
                        <input
                            type="text"
                            name="guarantorName"
                            value={formData.guarantorName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="inline-item">
                        <label>Guarantor's Mobile No.</label>
                        <input
                            type="Number"
                            name="guarantorMobile"
                            value={formData.guarantorMobile}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Guarantor's Gender</label>
                        <select name="gurantorGender" value={formData.gurantorGender} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="inline-item">
                        <label>Relationship with patient</label>
                        <input
                            type="text"
                            name="guarantorRelationship"
                            value={formData.guarantorRelationship}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-headline">
                    <p>Insurance Details</p>
                    <div className='headline-line'></div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Insurance Provider</label>
                        <select name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} >
                            <option value="">Select</option>
                            <option value="NHIF">NHIF</option>
                            <option value="UnitedHealthcare">United Healthcare</option>
                            <option value="Aetna">Aetna</option>
                        </select>
                    </div>
                    <div className="inline-item">
                        <label>Insurance Name</label>
                        <input
                            type="text"
                            name="insuranceName"
                            value={formData.insuranceName}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Card Number (ID No.)</label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="inline-item">
                        <label>Insurance Number (Member No.)</label>
                        <input
                            type="text"
                            name="insuranceNumber"
                            value={formData.insuranceNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group inline">
                    <div className="inline-item">
                        <label>Facility Code</label>
                        <input
                            type="text"
                            name="facilityCode"
                            value={formData.facilityCode}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="inline-item">
                        <label>Initial Balance</label>
                        <input
                            type="number"
                            name="initialBalance"
                            value={formData.initialBalance}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <button type="submit" className="submit-btn">Update Patient</button>
            </form>
        </div>
    </>
  );
}

export default EditPatient;

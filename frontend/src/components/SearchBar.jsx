import React, { useEffect, useState } from 'react';
import './styles/SearchBar.css';
import { environment } from '../../utlis/environment';

const SearchBar = ({ onSearch }) => {
  const [staff, setStaff] = useState(null);
  const [month, setMonth] = useState('');
  const [staffList, setStaffList] = useState([]); // Store all staff names
  const [filteredStaff, setFilteredStaff] = useState([]); // Store filtered suggestions

  // Fetch all staff names when the component first loads (this runs once)
  const fetchStaff = async () => {
    try {
      const response = await fetch(`${environment.url}/api/common/get-staff-list`,{
        method: "GET",
        headers:{
            token: localStorage.getItem('token')
        }
      }); // Assume there's an API to fetch staff
      const data = await response.json();
      setStaffList(data.totalItems); // Save the staff list to state
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleStaffChange = (e) => {
    const input = e.target.value;
    setStaff(input);

    // Filter staff when user types more than 2 characters
    if (input.length > 2) {
      const filtered = staffList.filter((staffMember) =>
        staffMember.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff([]); // Clear suggestions when input length is less than 3
    }
  };

  const handleStaffSelect = (staffName) => {
    setStaff(staffName); // Set selected staff name
    setFilteredStaff([]); // Clear suggestions after selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (staff && month) onSearch(staff, month);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="input-container">
        <input
          type="text"
          placeholder="Search staff by name..."
          value={staff?.name}
          onChange={handleStaffChange}
        />
        {filteredStaff.length > 0 && (
          <div className="attendence-suggestions">
            {filteredStaff.map((staffMember) => (
              <div
                key={staffMember.id} // Assuming each staff has a unique ID
                className="attendence-suggestion-item"
                onClick={() => handleStaffSelect(staffMember)}
              >
                {staffMember.name} ({staffMember.phone || "N/A"})
              </div>
            ))}
          </div>
        )}
      </div>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;

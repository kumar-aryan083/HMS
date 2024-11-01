import React, { useState, useEffect } from 'react';
import './styles/AssignTests.css';

const AssignTests = ({ opdId, setNotification }) => {
  const [testOptions, setTestOptions] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/tests/get-tests',{
          method: "GET",
          headers:{
            "Content-Type": "application/json",
            token: localStorage.getItem('token')
          }
        });
        const data = await response.json();
        if(response.ok){
          setTestOptions(data);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleTestSelection = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const handleAssignTests = async () => {
    console.log(selectedTests);
    setLoading(true);
  try {
    const response = await fetch(`http://localhost:8000/api/opd/${opdId}/assign-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('token'),
      },
      body: JSON.stringify({ tests: selectedTests }), // Send the selected tests
    });
    const data = await response.json();
    if (response.ok) {
      setNotification(data.message);
      setSelectedTests([]); // Reset the selected tests
    } else {
      alert('Error assigning tests');
    }
  } catch (error) {
    console.error('Error assigning tests:', error);
    setNotification('Error assigning tests');
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="assign-tests-container">
      <h2 className="assign-tests-title">Assign Tests</h2>
      {loading && <div className="loading">Loading...</div>}
      <ul className="assign-tests-list">
        {testOptions.map((test) => (
          <li key={test._id} className="assign-tests-list-item">
            <input
              type="checkbox"
              checked={selectedTests.includes(test._id)}
              onChange={() => handleTestSelection(test._id)}
            />
            <label>{test.name}</label>
          </li>
        ))}
      </ul>
      <button
        className="assign-tests-button"
        onClick={handleAssignTests}
        disabled={!selectedTests.length || loading}
      >
        Assign Selected Tests
      </button>
    </div>
  );
};

export default AssignTests;

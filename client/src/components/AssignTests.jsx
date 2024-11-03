import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react'; // Ensure you have TinyMCE installed
import './styles/AssignTests.css';

const AssignTests = ({ opdId, setNotification }) => {
  const [testOptions, setTestOptions] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/tests/get-tests', {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem('token'),
          },
        });
        const data = await response.json();
        if (response.ok) {
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

  const handleEditorChange = (value) => {
    setNotes(value); // Update notes state with editor content
  };

  const handleAssignTests = async () => {
    // console.log(selectedTests);
    // console.log(notes);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/opd/${opdId}/assign-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token'),
        },
        body: JSON.stringify({ tests: selectedTests, notes }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotification(data.message);
        setSelectedTests([]);
        setNotes(''); // Reset notes
        if (editorRef.current) editorRef.current.setContent(''); // Clear editor
      } else {
        setNotification('Error assigning tests');
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
      <div className="assign-tests-options">
        {testOptions.map((test) => (
          <div key={test._id} className="assign-tests-option">
            <input
              type="checkbox"
              checked={selectedTests.includes(test._id)}
              onChange={() => handleTestSelection(test._id)}
            />
            <label>{test.name}</label>
          </div>
        ))}
      </div>
      <div className="notes-container">
        <h3>Notes</h3>
        <Editor
          apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1" // Replace with your actual API key
          onInit={(_evt, editor) => (editorRef.current = editor)}
          initialValue="<p>Write notes about the tests here...</p>"
          onEditorChange={handleEditorChange}
          init={{
            height: 300,
            menubar: false,
            plugins: [
              "advlist autolink lists link image charmap preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table code help wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic | " +
              "alignleft aligncenter alignright alignjustify | " +
              "bullist numlist outdent indent | removeformat | help",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />
      </div>
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

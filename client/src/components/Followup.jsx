import React, { useState, useEffect, useRef } from 'react';
import { Editor } from "@tinymce/tinymce-react";
import './styles/Followup.css';

const Followup = ({ opdId, setNotification }) => {
  const [followUpDate, setFollowUpDate] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState('');
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  const handleEditorChange = (value) => {
    setContent(value);
  };

  // Fetch list of doctors to populate the dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(
          'http://localhost:8000/api/employee/get-doctors',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              token: localStorage.getItem('token'),
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setDoctors(data.doctors);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/api/opd/${opdId}/followup`,{
        method: "POST",
        headers:{
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify({followUpDate: followUpDate, doctorId: doctorId, notes: content})
      });
      const data = await res.json();
      if(res.ok){
        setNotification(data.message);
        setDoctorId("");
        setFollowUpDate("");
        if (editorRef.current) editorRef.current.setContent('');
      }
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="follow-up-component">
      <h2>Add Follow-Up Date</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="followUpDate">Follow-Up Date</label>
            <input
              type="date"
              id="followUpDate"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="doctorId">Assigning Doctor</label>
            <select
              id="doctorId"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <Editor
        apiKey="cen6pw58w47qzqvolhnhn1l5xtuxtnqg49kopee4ld29cet1"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        initialValue="<p>Remove this and write your notes.</p>"
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
        </div>
        <button type="submit">Add Follow-Up</button>
      </form>
    </div>
  );
};

export default Followup;

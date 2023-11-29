import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "../styles/Register.css";
import { API_URL } from "../utils";
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('freelancer'); // Default role
  const [bio, setBio] = useState('');
  const [skills, setSkills] =useState([]); // Array to store skills

  const handleRegister = async () => {
    try {
      // Capture user details in an object
      const userDetails = {
        name: name,
        email: email,
        role: role,
        bio: bio,
        skills: skills,
        password: password, // Added password for registration
      };

      // Send registration data to the API endpoint
      const response = await axios.post(`${API_URL}/api/register`, userDetails);


      // Handle successful registration
      console.log('Registration successful!', response.data);
      alert('Registration successful. Please log in to continue.');

      // Redirect to the login page or perform other actions
      window.location.href = '/login';
    } catch (error) {
      // Handle registration failure
      console.error('Registration failed:', error.message);
      alert('Registration failed. Please try again later.');
    }
  };

  const handleSkillChange = (event) => {
    const newSkills = skills.slice();
    if (event.target.checked) {
      newSkills.push(event.target.value);
    } else {
      newSkills.splice(skills.indexOf(event.target.value), 1);
    }
    setSkills(newSkills);
  };




  return (
    <div className="register-container">
      <h1>Register</h1>
      <form>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />

        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="form-input">
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
        </select>

        <label>Bio:</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="form-input" />

        <label>Skills:</label>
        <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="form-input" />


         

        


    



        {/* Login button that redirects to the login page */}
        <p>Already a member? <Link to="/login">Login</Link></p>

        <button type="button" onClick={handleRegister} className="register-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;

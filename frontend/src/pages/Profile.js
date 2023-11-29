import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from "../utils";
import Navbar from '../components/navbar';
import "../styles/Profile.css"
const Profile = () => {
  const userdetails = localStorage.getItem("user") !== undefined ? JSON.parse(localStorage.getItem("user")) : null;
  const userid = userdetails.user.id;

  const [profile, setProfile] = useState({ name: '', email: '', bio: '', skills: [] });
  const [isEditing, setEditing] = useState(false);

  useEffect(() => {
    // Fetch user profile data from the API
    const fetchProfileData = async () => {
      try {
        const userId = localStorage.getItem("user") !== undefined ? JSON.parse(localStorage.getItem("user")).user.id : null;
        const response = await axios.get(`${API_URL}/api/profile/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error.message);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    // Gather updated profile details from the form inputs
    const updatedProfile = {
      name: event.target.name.value,
      bio: event.target.bio.value,
      skills: event.target.skills.value.split(',').map(skill => skill.trim()),
    };

    // Update profile data on the server
    try {
      
      await axios.put(`${API_URL}/api/profile/${userid}`, updatedProfile);

      // Update local profile state with the updated details
      setProfile({ ...profile, ...updatedProfile });
      setEditing(false); // Disable editing mode after updating
    } catch (error) {
      console.error('Error updating profile:', error.message);
    }
  };

  return (
    <div>
      <Navbar/>
    <div className="profile-container">
      <h2>Profile</h2>
      {isEditing ? (
        <form onSubmit={handleUpdateProfile}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />

          <label htmlFor="bio">Bio:</label>
          <textarea id="bio" name="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows="5" />

          <label htmlFor="skills">Skills:</label>
          <input type="text" id="skills" name="skills" value={profile.skills.join(', ')} onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(skill => skill.trim()) })} />

          <button type="submit">Update Profile</button>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <p><strong>Skills:</strong> {profile.skills.join(', ')}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
    </div>
  );
};

export default Profile;

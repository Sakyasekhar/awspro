// Inside your CreateProject.js component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

import "../styles/createproject.css";

const CreateProject = () => {
  const userdetails = localStorage.getItem("user") !== undefined ? JSON.parse(localStorage.getItem("user")) : null;
  const userid = userdetails.user.id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('open'); // Default status
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);

  // Get all projects
  useEffect(() => {

    const fetchProjects = async () => {
      const projectsResponse = await axios.get(`http://localhost:3001/api/myprojects/${userid}`);
      const requestsResponse = await axios.get(`http://localhost:3001/api/projectrequests/${userid}`);

      // Assuming the response contains an array of projects with an order property
      const orderedProjects = projectsResponse.data.sort((a, b) => a.order - b.order);

      setProjects(orderedProjects);
      setRequests(requestsResponse.data);
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      const projectData = {
        name: name,
        description: description,
        status: status,
      };

      const response = await axios.post('http://localhost:3001/api/createproject', projectData);

      console.log('Project created successfully:', response.data);

      // Handle success, e.g., redirect to projects page
      window.location.href = '/projects';
    } catch (error) {
      console.error('Error creating project:', error.message);
      // Handle error, show user a message, etc.
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      // Send a request to the server to accept the project request
      await axios.post(`http://localhost:3001/api/projectrequests/${requestId}/accept`);

      // Refresh the list of project requests
      const updatedRequests = requests.filter((request) => request.id !== requestId);
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Error accepting request:', error.message);
      // Handle the error, e.g., show a notification to the user
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      // Send a request to the server to reject the project request
      await axios.post(`http://localhost:3001/api/projectrequests/${requestId}/reject`);

      // Refresh the list of project requests
      const updatedRequests = requests.filter((request) => request.id !== requestId);
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Error rejecting request:', error.message);
      // Handle the error, e.g., show a notification to the user
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      // Send a request to the server to delete the project
      await axios.delete(`http://localhost:3001/api/projects/${projectId}`);

      // Refresh the list of projects
      const updatedProjects = projects.filter((project) => project.id !== projectId);
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error deleting project:', error.message);
      // Handle the error, e.g., show a notification to the user
    }
  };

  return (
    <>
    <Navbar/>
    <div className="create-project-container">
  <div className="project-requests">
    <div className="heading"><h3>Project Requests</h3></div>
    <div className="projectdata">
    {requests.map((request) => (
      <div className="request-box" key={request.id}>
        <p><strong>ID:</strong> {request.id}</p>
        <p><strong>Project Name:</strong> {request.project_name}</p>
        <p><strong>Freelancer ID:</strong> {request.freelancer_id}</p>
        <p><strong>Freelancer Name:</strong> {request.freelancer_name}</p>
      <div>
          <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
          <button onClick={() => handleRejectRequest(request.id)}>Reject</button>
        </div>
      
      </div>
      
    ))}
    </div>
  </div>
   
  
  <div className="project-list">
  <div><h3 className>Your Projects</h3></div>
  <div className="projectdata">
    {projects.map((project) => (
      <div className="project-box" key={project.id}>
        <p><strong>ID:</strong> {project.id}</p>
        <p><strong>Name:</strong> {project.name}</p>
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Status:</strong> {project.status}</p>
        <button onClick={() => handleDeleteProject(project.id)}>Delete</button>
      </div>
    ))}
    </div>
  </div>

  <div className="create-project-form">
    <h1>Create Project</h1>
    <form>
      <label>Name:</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

      <label>Description:</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <label>Status:</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>

      <button className="create-button" type="button" onClick={handleCreateProject}>
        Create Project
      </button>
    </form>
  </div>
</div>

    </>
  );
};

export default CreateProject;

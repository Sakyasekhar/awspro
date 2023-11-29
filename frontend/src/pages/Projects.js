import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import { createBrowserHistory } from 'history';
import "../styles/Projects.css";
import { API_URL } from "../utils";
const history = createBrowserHistory();

const Projects = () => {
  const userdetails = localStorage.getItem("user") !== undefined ? JSON.parse(localStorage.getItem("user")) : null;
  const userid = userdetails.user.id;
  
  const [projects, setProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);

  // Get all projects
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await axios.get(`${API_URL}/api/projects/${userid}`);
      // Assuming the response contains an array of projects with an order property
      const orderedProjects = res.data.sort((a, b) => a.order - b.order);
      setProjects(orderedProjects);
    };

    fetchProjects();
  }, []);

  const handleJoinProject = async (projectId) => {
    try {
      // Assuming you have an authentication system to get the current user ID or details
      const freelancerId = userid; // Replace this with the actual user ID or details
  
      // Send a request to the server to create a join request
      await axios.post(`${API_URL}/api/projects/${projectId}/join`, { freelancerId });
  
      // Update the projects list after requesting to join
      const updatedProjects = projects.map((project) =>
        project.id === projectId ? { ...project, approvalStatus: 'pending' } : project
      );
  
      setProjects(updatedProjects);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'Join request already exists') {
        window.alert('Join request already sent for this project');
      } else {
        console.error('Error sending join request:', error.message);
        // Handle other errors, e.g., show a notification to the user
      }
    }
  };

  const fetchJoinedProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/requestedprojects/${userid}`);
      setJoinedProjects(response.data);
    } catch (error) {
      console.error('Error fetching joined projects:', error.message);
    }
  };
  
  useEffect(() => {
    fetchJoinedProjects();
  }, []);
  
  const redirectToProjectMembersPage = (projectId) => {
    console.log("id");
    window.location.href =`/teamworkspace/${projectId}`;
  };
  
  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Projects</h1>
        <div>
          <h3>Joined Projects</h3>
          <div className="project-box-container">
            {joinedProjects.map((project) => (
              <div key={project.id} className="project-box joined-box">
                <p>{project.name} - Status: {project.join_status}</p>
                {project.join_status === 'accepted' && (
                  <button id = "teamworkbutton" onClick={() => redirectToProjectMembersPage(project.id)}>
                    Team Workspace
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>All projects</h3>
          <div className="project-box-container">
            {projects.map((project) => (
              <div key={project.id} className="project-box">
                <p>ID: {project.id}</p>
                <p>Client: {project.client_name}</p>
                <p>Name: {project.name}</p>
                <p>Description: {project.description}</p>
                <p>Status: {project.status}</p>
                <div>
                  {/* Check if the current user is not already a member before showing the Join button */}
                  <button onClick={() => handleJoinProject(project.id)}>Join</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;

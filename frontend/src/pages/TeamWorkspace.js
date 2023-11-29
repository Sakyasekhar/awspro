import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/TeamWorkspace.css';
import '../styles/FileSharingSection.css';

const TeamWorkspace = () => {
  const userdetails = localStorage.getItem("user") !== undefined ? JSON.parse(localStorage.getItem("user")) : null;
  const username = userdetails.user.name;
  const { projectId } = useParams();
  const [projectMembers, setProjectMembers] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchSharedFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/projects/${projectId}/files`);
      setSharedFiles(response.data);
    } catch (error) {
      console.error('Error fetching shared files:', error.message);
    }
  };

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/projects/${projectId}/members`);
        setProjectMembers(response.data);
      } catch (error) {
        console.error('Error fetching project members:', error.message);
      }
    };

    fetchProjectMembers();
    fetchSharedFiles();
  }, [projectId]);

  console.log('projectMembers:', projectMembers);
  console.log('sharedFiles:', sharedFiles);

  const handleDownload = async (fileId, sender,fileName) => {
    try {
      // Make a request to the server to get the file download URL
      const response = await axios.get(`http://localhost:3001/projects/${fileId}/${sender}/files/${fileName}/download`, {
        responseType: 'blob',
      });
  
      // Create a temporary link element to trigger the file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error.message);
    }
  };
  
  
   

  const handleShareFile = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Make a request to the server to share the file
      await axios.post(`http://localhost:3001/projects/${projectId}/${username}/files/share`, formData);

      // Update the shared files list after sharing
      fetchSharedFiles();
    } catch (error) {
      console.error('Error sharing file:', error.message);
    }
  };

  return (
    <div className="team-workspace-container">
      <div className="members-list">
        <h2>Project Members</h2>
        <ul>
          {projectMembers.map((member) => (
            <li key={member.id}>{member.name}</li>
          ))}
        </ul>
      </div>

      <div className="shared-files-section">
        <h2>Shared Files</h2>
        
        <ul>
          {sharedFiles.map((file) => (
          <li key={file.id}>
            {file.name} (Owner: {file.sender}) <button onClick={() => handleDownload(file.id,file.sender, file.name)}>Download</button>
          </li>
          ))}
       </ul>


        <div className="file-sharing-section">
          <h2>File Sharing Section</h2>
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <button onClick={handleShareFile}>Share File</button>
        </div>
      </div>
    </div>
  );
};

export default TeamWorkspace;

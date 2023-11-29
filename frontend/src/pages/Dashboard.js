import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

const Files = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/files')
      .then(response => setFiles(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
       <Navbar />
      <h1>Files</h1>
      <ul>
        {files.map(file => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Files;

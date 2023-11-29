const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const multer = require('multer');
const upload = multer();
const filemanager = require('../models/aws'); // Import your AWS file manager

// Fetch user profile data
router.get('/profile/:userid', async (req, res) => {
  const {userid} = req.params; // Assuming user ID is stored in the session
  try {
    const [profile] = await connection.query('SELECT name, email, bio, skills FROM users WHERE id = ?', [userid]);
    if (!profile.length) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile data
router.put('/profile/:userid', async (req, res) => {
  const {userid} = req.params;  // Assuming user ID is stored in the session
  const { name, bio, skills } = req.body;
  try {
    await connection.query('UPDATE users SET name = ?, bio = ?, skills = ? WHERE id = ?', [name, bio, JSON.stringify(skills), userid]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get project members
router.get('/projects/:projectId/members', async (req, res) => {
  const projectId = req.params.projectId;
  // console.log(projectId);

  const query = `
  SELECT u.id, u.name, u.email, u.bio, u.skills
  FROM users u
  JOIN project_members pm ON u.id = pm.user_id
  WHERE pm.project_id = ?;
`;

try {
  const [members] = await connection.query(query, [projectId]);
  res.json(members);
} catch (error) {
  console.error('Error executing query:', error.message);
  throw error;
}
});

// Endpoint to get shared files for a project
router.get('/projects/:projectId/files', async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Use your function to get a list of files for the project from S3
    const files = await filemanager.getFileInfoFromS3(projectId);
    res.json(files);
  } catch (error) {
    console.error('Error fetching shared files:', error.message);
    res.status(500).send('Error fetching shared files');
  }
});

// Endpoint to handle file downloads
// Endpoint to handle file downloads
router.get('/projects/:projectId/:sender/files/:fileId/download', async (req, res) => {
  const projectId = req.params.projectId;
  const sender = req.params.sender;
  const fileId = req.params.fileId;

  try {
    // Use your function to download the file from S3
    const fileContent = await filemanager.downloadFileFromS3(projectId,sender ,fileId);

    // Set headers and send the file content
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileContent.name}"`);
    res.send(fileContent.content);
  } catch (error) {
    console.error('Error fetching file data:', error.message);
    res.status(500).send('Error fetching file data');
  }
});


router.post('/projects/:projectId/:userid/files/share', upload.single('file'), async (req, res) => {
  const projectId = req.params.projectId;
  const sender = req.params.userid; // Replace with actual sender information
  const file = req.file; // This contains information about the uploaded file

  try {
    // Upload the file to S3
    await filemanager.uploadFileToS3(projectId, sender, file);

    // Save file information (e.g., file.name, etc.) to a database

    res.status(200).send('File shared successfully');
  } catch (error) {
    console.error('Error sharing file:', error.message);
    res.status(500).send('Error sharing file');
  }
});

module.exports = router;

const AWS = require('aws-sdk');
const fs = require('fs');

const S3_CLIENT = new AWS.S3();

const bucketName = 'aws-project13'; // Replace with your S3 bucket name

class filemanager{
    // Modify getFileInfoFromS3 in your backend
    static getFileInfoFromS3 = async (projectId) => {
        const objects = await S3_CLIENT.listObjectsV2({
          Bucket: bucketName,
          Prefix: `${projectId}/`,
        }).promise();
      
        const files = objects.Contents.map((object) => {
            const keyParts = object.Key.split('/');
            return {
              id: keyParts[0],
              name: keyParts[2],
              size: object.Size,
              sender: keyParts[1], // Assuming sender information is part of the S3 key
            };
        });
          
      
        return files;
      };
      

// Modify downloadFileFromS3 in your backend
static downloadFileFromS3 = async (projectId,sender ,fileId) => {
    const getObjectParams = {
      Bucket: bucketName,
      Key: `${projectId}/${sender}/${fileId}`,
    };
  
    try {
      const getObjectResponse = await S3_CLIENT.getObject(getObjectParams).promise();
  
      const fileContent = {
        name: getObjectResponse.Metadata.name, // Assuming you store the file name in S3 object metadata
        content: getObjectResponse.Body,
      };
  
      return fileContent;
    } catch (error) {
      console.error('Error downloading file from S3:', error.message);
      console.error('Used key:', getObjectParams.Key);
      throw error;
    }
  };
  
  

// Modify uploadFileToS3 in your backend
static uploadFileToS3 = async (projectId, sender, file) => {
    const uploadParams = {
        Bucket: bucketName,
        Key: `${projectId}/${sender}/${file.originalname}`,
        
      };
      
  
    await S3_CLIENT.putObject(uploadParams).promise();
  
    return bucketName;
  };



}

  

module.exports = filemanager;


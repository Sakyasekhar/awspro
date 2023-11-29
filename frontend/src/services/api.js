import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const fetchProfile = async (userId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axios.put(`${BASE_URL}/users/${profileData.id}`, profileData);
  return response.data;
};

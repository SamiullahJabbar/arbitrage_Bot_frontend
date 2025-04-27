import axios from 'axios';

// Base URL for API requests
const baseUrl = 'http://127.0.0.1:8000/api'; // Replace this with actual API URL

// Function to fetch rates
export const fetchRates = async () => {
  try {
    const response = await axios.get(`${baseUrl}/rates/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rates:', error);
    return null;
  }
};

export const fetchArbitrageData = async () => {
  try {
    const response = await axios.get(`${baseUrl}/arbitrage/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching arbitrage data:', error);
    return null;
  }
};

export const fetchBalances = async () => {
  try {
    const response = await axios.get(`${baseUrl}/get-all-balances/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching balances:', error);
    return null;
  }
};


export const fetchTradeLogs = async () => {
  try {
    const response = await axios.get(`${baseUrl}/trade_logs/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trade logs:', error);
    return null;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${baseUrl}/signup/`, userData);
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    return { status: 'error', message: 'Failed to register user' };
  }
};


export const loginUser = async (loginData) => {
  try {
    const response = await axios.post(`${baseUrl}/login/`, loginData);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    return { status: 'error', message: 'Failed to login' };
  }
};
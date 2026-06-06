import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const generateBusinessPlan = async (prompt) => {
  const response = await axios.post(
    `${API_URL}/generate-plan`,
    { prompt }
  );

  return response.data;
};
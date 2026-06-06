import axios from "axios";

const API_URL = "http://localhost:5000";

export const generateBusinessPlan = async (prompt) => {
  const response = await axios.post(
    `${API_URL}/generate-plan`,
    { prompt }
  );

  return response.data;
};
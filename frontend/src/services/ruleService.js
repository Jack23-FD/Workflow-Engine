import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const ruleService = {
  getRulesByStep: async (stepId) => {
    const response = await axios.get(`${API_URL}/steps/${stepId}/rules`);
    return response.data;
  },

  createRule: async (stepId, ruleData) => {
    const response = await axios.post(`${API_URL}/steps/${stepId}/rules`, ruleData);
    return response.data;
  },

  updateRule: async (ruleId, ruleData) => {
    const response = await axios.put(`${API_URL}/rules/${ruleId}`, ruleData);
    return response.data;
  },

  deleteRule: async (ruleId) => {
    await axios.delete(`${API_URL}/rules/${ruleId}`);
  }
};

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const workflowService = {
    getAll: () => api.get('/workflows'),
    getById: (id) => api.get(`/workflows/${id}`),
    create: (data) => api.post('/workflows', data),
    update: (id, data) => api.put(`/workflows/${id}`, data),
    delete: (id) => api.delete(`/workflows/${id}`),
    execute: (id, dataOrString, triggeredBy = 'Web UI') => {
        // Accept either a Map object or a raw JSON string
        let parsedData = dataOrString;
        if (typeof dataOrString === 'string') {
            try { parsedData = JSON.parse(dataOrString); } catch (_) { parsedData = {}; }
        }
        return api.post(`/workflows/${id}/execute`, { data: parsedData, triggeredBy });
    },
};

export const stepService = {
    getById: (id) => api.get(`/steps/${id}`),
    getByWorkflow: (workflowId) => api.get(`/workflows/${workflowId}/steps`),
    add: (workflowId, data) => api.post(`/workflows/${workflowId}/steps`, data),
    update: (id, data) => api.put(`/steps/${id}`, data),
    delete: (id) => api.delete(`/steps/${id}`),
};

export const executionService = {
    getExecutions: (page = 0, size = 10, filters = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (filters.status) params.append('status', filters.status);
        if (filters.workflowId) params.append('workflowId', filters.workflowId);
        return api.get(`/executions?${params.toString()}`);
    },
    getById: (id) => api.get(`/executions/${id}`),
    approve: (id, approverId) => api.post(`/executions/${id}/approve`, { approverId }),
    cancel: (id) => api.post(`/executions/${id}/cancel`),
    retry: (id) => api.post(`/executions/${id}/retry`),
};

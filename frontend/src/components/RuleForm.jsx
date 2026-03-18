import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ruleEditor.css';

const RuleForm = ({ stepId, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    priority: '',
    condition: '',
    nextStepId: ''
  });
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        priority: initialData.priority || '',
        condition: initialData.condition || '',
        nextStepId: initialData.nextStepId || ''
      });
    }
    
    // Fetch available steps for the "Next Step" dropdown
    const fetchSteps = async () => {
      try {
        // We need the workflowId to fetch its steps. 
        // Assuming the backend has an endpoint or we can get it via the step
        // For simplicity, we fetch all steps and filter, or fetch from a known endpoint
        // You might need to adjust this endpoint based on your exact API setup
        const stepResponse = await axios.get(`http://localhost:8080/api/steps/${stepId}`);
        const workflowId = stepResponse.data.workflowId;
        
        const workflowStepsResponse = await axios.get(`http://localhost:8080/api/workflows/${workflowId}/steps`);
        // Filter out the current step to prevent self-loops, though some workflows might allow it
        setSteps(workflowStepsResponse.data);
      } catch (err) {
        console.error("Error fetching steps:", err);
        setError("Failed to load available steps for the dropdown.");
      }
    };

    fetchSteps();
  }, [initialData, stepId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.priority) {
        throw new Error("Priority is required.");
      }
      if (!formData.condition) {
        throw new Error("Condition is required.");
      }

      await onSave({
        ...formData,
        priority: parseInt(formData.priority, 10),
        nextStepId: formData.nextStepId || null
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save rule.");
      setLoading(false);
    }
  };

  const isDefault = formData.condition.trim().toUpperCase() === 'DEFAULT';

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="priority">Priority (Lower number = Higher priority)</label>
        <input
          type="number"
          id="priority"
          name="priority"
          className="form-control"
          value={formData.priority}
          onChange={handleChange}
          required
          min="1"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="condition">Condition (Use 'DEFAULT' for fallback rule)</label>
        <input
          type="text"
          id="condition"
          name="condition"
          className="form-control"
          value={formData.condition}
          onChange={handleChange}
          required
          placeholder="e.g., amount > 100 && country == 'US'"
          disabled={loading}
        />
        {isDefault && (
          <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
            This rule will be used as a fallback. It must have the lowest priority.
          </small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="nextStepId">Next Step</label>
        <select
          id="nextStepId"
          name="nextStepId"
          className="form-control"
          value={formData.nextStepId}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="">-- Finish / No Next Step --</option>
          {steps.map(step => (
            <option key={step.id} value={step.id}>
              {step.name} {step.id === stepId ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="modal-footer">
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Rule'}
        </button>
      </div>
    </form>
  );
};

export default RuleForm;

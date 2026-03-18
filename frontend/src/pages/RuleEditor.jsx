import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ruleService } from '../services/ruleService';
import { Plus, Trash2, Edit2, X, Save, ChevronRight, Info } from 'lucide-react';
import BackButton from '../components/BackButton';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const API = 'http://localhost:8080/api';

const STEP_TYPES = ['task', 'approval', 'notification'];

const RuleEditor = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();

  const [stepData, setStepData] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ condition: '', nextStepId: '', priority: 1 });

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const stepRes = await axios.get(`${API}/steps/${stepId}`);
        setStepData(stepRes.data);
        const stepsRes = await axios.get(`${API}/workflows/${stepRes.data.workflowId}/steps`);
        setWorkflowSteps(stepsRes.data);
        const rulesList = await ruleService.getRulesByStep(stepId);
        setRules(rulesList);
      } catch (err) {
        setError('Failed to load data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    if (stepId) fetch();
  }, [stepId]);

  const openAddModal = () => {
    setEditingRule(null);
    setForm({ condition: '', nextStepId: '', priority: rules.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setForm({ condition: rule.condition, nextStepId: rule.nextStepId || '', priority: rule.priority });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingRule(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, nextStepId: form.nextStepId || null, priority: parseInt(form.priority) || 1 };
      if (editingRule) await ruleService.updateRule(editingRule.id, payload);
      else await ruleService.createRule(stepId, payload);
      const updated = await ruleService.getRulesByStep(stepId);
      setRules(updated);
      closeModal();
      showAlert('success', editingRule ? 'Rule updated!' : 'Rule created!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save rule.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await ruleService.deleteRule(ruleId);
      const updated = await ruleService.getRulesByStep(stepId);
      setRules(updated);
      showAlert('success', 'Rule deleted.');
    } catch {
      showAlert('error', 'Failed to delete rule.');
    }
  };

  const getStepName = (stId) => workflowSteps.find(s => s.id === stId)?.name || stId || '—';

  if (loading) return <Loader text="Loading rules..." />;
  if (error && !stepData) return (
    <div>
      <BackButton />
      <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <BackButton to={`/editor/${stepData?.workflowId}`} label="Back to Workflow" />
        <div className="page-header-row" style={{ marginTop: 8 }}>
          <div className="page-header-left">
            <div className="breadcrumb">
              <span className="breadcrumb-link" onClick={() => navigate('/')}>Workflows</span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span className="breadcrumb-link" onClick={() => navigate(`/editor/${stepData?.workflowId}`)}>
                Editor
              </span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span>Rules: {stepData?.name}</span>
            </div>
            <h1 className="page-title">Rule Manager</h1>
            <p className="page-subtitle">
              Routing rules for step&nbsp;
              <strong>{stepData?.name}</strong>
              &nbsp;&mdash;&nbsp;
              <StatusBadge status={stepData?.stepType} dot={false} />
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} /> Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <Info size={16} />
        Rules are evaluated in priority order. Use <code>DEFAULT</code> as the condition for a catch-all fallback rule.
        Leave <strong>Next Step</strong> empty to end the workflow.
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✓' : '⚠'} {alert.msg}</div>}

      {/* Rules Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title-text">Rules ({rules.length})</span>
        </div>
        {rules.length === 0 ? (
          <EmptyState
            icon="⚙️"
            title="No rules configured"
            message="Add routing rules to define what happens after this step executes."
            action={
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} /> Add First Rule
              </button>
            }
          />
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Condition</th>
                  <th>Next Step</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...rules].sort((a, b) => a.priority - b.priority).map(rule => (
                  <tr key={rule.id}>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        fontWeight: 800, fontSize: '0.8125rem'
                      }}>
                        {rule.priority}
                      </span>
                    </td>
                    <td>
                      <code style={{ background: 'var(--gray-100)', padding: '3px 8px', borderRadius: 4, fontSize: '0.8125rem' }}>
                        {rule.condition}
                      </code>
                    </td>
                    <td>
                      {rule.nextStepId
                        ? <span className="tag">{getStepName(rule.nextStepId)}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>END (terminate)</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(rule)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(rule.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rule Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingRule ? 'Edit Rule' : 'Create Rule'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label form-label-required">Condition</label>
                <input
                  className="form-control"
                  value={form.condition}
                  onChange={e => setForm({ ...form, condition: e.target.value })}
                  placeholder='e.g., amount > 1000 or DEFAULT'
                />
                <div className="form-hint">Use <code>DEFAULT</code> as a catch-all fallback.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Next Step (leave empty to end workflow)</label>
                <select
                  className="form-control"
                  value={form.nextStepId}
                  onChange={e => setForm({ ...form, nextStepId: e.target.value })}
                >
                  <option value="">— End of Workflow —</option>
                  {workflowSteps
                    .filter(s => s.id !== stepId)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Order: {s.stepOrder})</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                />
                <div className="form-hint">Lower numbers are evaluated first.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RuleEditor;

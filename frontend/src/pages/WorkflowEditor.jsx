import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowService, stepService } from '../services/api';
import { Save, Plus, Trash2, Edit2, Settings, X, ChevronRight } from 'lucide-react';
import BackButton from '../components/BackButton';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [workflow, setWorkflow] = useState({ name: '', inputSchema: '{}', isActive: true });
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [showStepModal, setShowStepModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [alert, setAlert] = useState(null);
  const [stepAlert, setStepAlert] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (id) loadWorkflow(); }, [id]);

  const showAlert = (type, msg, target = 'main') => {
    if (target === 'main') setAlert({ type, msg });
    else setStepAlert({ type, msg });
    setTimeout(() => target === 'main' ? setAlert(null) : setStepAlert(null), 3500);
  };

  const loadWorkflow = async () => {
    try {
      const wfRes = await workflowService.getById(id);
      const wfData = wfRes.data;
      const stepRes = await stepService.getByWorkflow(id);
      const loadedSteps = stepRes.data;
      setSteps(loadedSteps);
      if (!wfData.startStepId && loadedSteps.length > 0) {
        const sorted = [...loadedSteps].sort((a, b) => a.stepOrder - b.stepOrder);
        wfData.startStepId = sorted[0].id;
      }
      setWorkflow(wfData);
    } catch (err) {
      showAlert('error', 'Failed to load workflow.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async (e) => {
    e.preventDefault();
    setErrors({});
    setSavingWorkflow(true);
    try {
      JSON.parse(workflow.inputSchema || '{}');
    } catch {
      setErrors({ inputSchema: 'Invalid JSON format.' });
      setSavingWorkflow(false);
      return;
    }
    try {
      if (id) {
        await workflowService.update(id, workflow);
        showAlert('success', 'Workflow saved successfully!');
      } else {
        const res = await workflowService.create(workflow);
        navigate(`/editor/${res.data.id}`);
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save workflow.');
    } finally {
      setSavingWorkflow(false);
    }
  };

  const openStepModal = (step = null) => {
    if (!id) { showAlert('error', 'Save the workflow first before adding steps.'); return; }
    setCurrentStep(step || { name: '', stepType: 'task', stepOrder: steps.length + 1, metadata: '{}' });
    setStepAlert(null);
    setShowStepModal(true);
  };

  const handleSaveStep = async () => {
    setSavingStep(true);
    try {
      if (currentStep.id) await stepService.update(currentStep.id, currentStep);
      else await stepService.add(id, currentStep);
      setShowStepModal(false);
      showAlert('success', `Step ${currentStep.id ? 'updated' : 'created'} successfully!`);
      loadWorkflow();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save step.', 'step');
    } finally {
      setSavingStep(false);
    }
  };

  const handleDeleteStep = async (stepId, stepName) => {
    if (!window.confirm(`Delete step "${stepName}"?`)) return;
    try {
      await stepService.delete(stepId);
      showAlert('success', 'Step deleted.');
      loadWorkflow();
    } catch (err) {
      showAlert('error', 'Failed to delete step.');
    }
  };

  if (loading) return <Loader text="Loading workflow..." />;

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <BackButton to="/" label="Back to Workflows" />
        <div className="page-header-row" style={{ marginTop: 8 }}>
          <div className="page-header-left">
            <div className="breadcrumb">
              <span className="breadcrumb-link" onClick={() => navigate('/')}>Workflows</span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span>{isNew ? 'New Workflow' : workflow.name || 'Edit'}</span>
            </div>
            <h1 className="page-title">{isNew ? 'Create Workflow' : `Edit: ${workflow.name}`}</h1>
          </div>
          {id && workflow.startStepId && (
            <div className="page-header-actions">
              <button
                className="btn btn-success"
                onClick={() => navigate(`/execute/${id}`)}
              >
                ▶ Run Workflow
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main alert */}
      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✓' : '⚠'} {alert.msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: id ? '340px 1fr' : '1fr', gap: 20 }}>
        {/* Left: Workflow Details */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title-text">Workflow Details</span>
              {id && <StatusBadge status={workflow.isActive ? 'active' : 'inactive'} dot={false} />}
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveWorkflow}>
                <div className="form-group">
                  <label className="form-label form-label-required">Name</label>
                  <input
                    className={`form-control${errors.name ? ' error' : ''}`}
                    value={workflow.name}
                    onChange={e => setWorkflow({ ...workflow, name: e.target.value })}
                    placeholder="e.g., Expense Approval"
                    required
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Input Schema (JSON)</label>
                  <textarea
                    className={`form-control${errors.inputSchema ? ' error' : ''}`}
                    rows={6}
                    value={workflow.inputSchema}
                    onChange={e => setWorkflow({ ...workflow, inputSchema: e.target.value })}
                  />
                  {errors.inputSchema && <div className="form-error">{errors.inputSchema}</div>}
                  <div className="form-hint">Define the expected input keys for this workflow.</div>
                </div>

                {id && steps.length > 0 && (
                  <div className="form-group">
                    <label className="form-label form-label-required">Start Step</label>
                    <select
                      className="form-control"
                      value={workflow.startStepId || ''}
                      onChange={e => setWorkflow({ ...workflow, startStepId: e.target.value || null })}
                    >
                      <option value="">— Select start step —</option>
                      {[...steps].sort((a, b) => a.stepOrder - b.stepOrder).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Order: {s.stepOrder})
                        </option>
                      ))}
                    </select>
                    <div className="form-hint">The first step executed when this workflow runs.</div>
                  </div>
                )}

                {id && (
                  <div className="form-group">
                    <label className="form-label">Active</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={workflow.isActive}
                        onChange={e => setWorkflow({ ...workflow, isActive: e.target.checked })}
                        style={{ width: 'auto', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="isActive" style={{ fontWeight: 400, marginBottom: 0, cursor: 'pointer' }}>
                        Workflow is active and can be executed
                      </label>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={savingWorkflow}>
                  <Save size={16} />
                  {savingWorkflow ? 'Saving...' : 'Save Workflow'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Steps */}
        {id && (
          <div>
            <div className="card">
              <div className="card-header">
                <span className="card-title-text">Steps ({steps.length})</span>
                <button className="btn btn-primary btn-sm" onClick={() => openStepModal()}>
                  <Plus size={14} /> Add Step
                </button>
              </div>
              <div className="card-body">
                {steps.length === 0 ? (
                  <EmptyState
                    icon="🪜"
                    title="No steps yet"
                    message="Add steps to define what happens when this workflow runs."
                    action={
                      <button className="btn btn-primary" onClick={() => openStepModal()}>
                        <Plus size={16} /> Add First Step
                      </button>
                    }
                  />
                ) : (
                  <div className="step-cards">
                    {[...steps].sort((a, b) => a.stepOrder - b.stepOrder).map(step => (
                      <div className="step-card" key={step.id}>
                        <div className="step-card-order">{step.stepOrder}</div>
                        <div className="step-card-info" style={{ flex: 1, minWidth: 0 }}>
                          <div className="step-card-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.name}</div>
                          <div className="step-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <StatusBadge status={step.stepType} dot={false} />
                            {workflow.startStepId === step.id && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                                ● Start Step
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="step-card-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => openStepModal(step)}
                            title="Edit Step"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/rules/${step.id}`)}
                            title="Manage Rules"
                          >
                            <Settings size={14} /> Rules
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDeleteStep(step.id, step.name)}
                            title="Delete Step"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step Modal */}
      {showStepModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowStepModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{currentStep?.id ? 'Edit Step' : 'Add New Step'}</h3>
              <button className="modal-close" onClick={() => setShowStepModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {stepAlert && <div className={`alert alert-${stepAlert.type}`}>{stepAlert.msg}</div>}
              <div className="form-group">
                <label className="form-label form-label-required">Step Name</label>
                <input
                  className="form-control"
                  value={currentStep?.name || ''}
                  onChange={e => setCurrentStep({ ...currentStep, name: e.target.value })}
                  placeholder="e.g., Manager Approval"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Step Type</label>
                <select
                  className="form-control"
                  value={currentStep?.stepType || 'task'}
                  onChange={e => setCurrentStep({ ...currentStep, stepType: e.target.value })}
                >
                  <option value="task">Task</option>
                  <option value="approval">Approval</option>
                  <option value="notification">Notification</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Order</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  value={currentStep?.stepOrder || 1}
                  onChange={e => setCurrentStep({ ...currentStep, stepOrder: parseInt(e.target.value) || 1 })}
                />
                <div className="form-hint">Lower values execute first.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStepModal(false)} disabled={savingStep}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveStep} disabled={savingStep}>
                <Save size={14} />
                {savingStep ? 'Saving...' : 'Save Step'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkflowEditor;

import React, { useState, useEffect } from 'react';
import { getEmployeeTasks, updateTaskStatus, submitLeaveRequest, getEmployeeLeaves } from '../api/api';
import { CheckSquare, Calendar, User, Clock, AlertCircle, Check, Send } from 'lucide-react';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [leaveReason, setLeaveReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, leavesRes] = await Promise.all([
        getEmployeeTasks(),
        getEmployeeLeaves()
      ]);
      setTasks(tasksRes.data);
      setLeaves(leavesRes.data);
    } catch (err) {
      setError('Failed to load employee dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, { status: newStatus });
      setSuccess('Task status updated successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmittingLeave(true);

    try {
      await submitLeaveRequest({
        reason: leaveReason,
        startDate,
        endDate
      });

      setSuccess('Leave request submitted to your manager!');
      setLeaveReason('');
      setStartDate('');
      setEndDate('');
      fetchData();
      setActiveTab('leaves');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const pendingTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;

  if (loading) {
    return <div className="portal-loader">Loading Employee Portal...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <div className="role-pill employee">
            <User size={16} />
            <span>EMPLOYEE PORTAL</span>
          </div>
          <h2>My Workspace & Tasks</h2>
          <p>Track assigned tasks, update project status, and apply for leaves.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon tasks-bg">
            <Clock size={24} color="#f59e0b" />
          </div>
          <div>
            <span className="stat-value">{pendingTasksCount}</span>
            <span className="stat-label">Tasks In Progress / Pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon team-bg">
            <CheckSquare size={24} color="#22c55e" />
          </div>
          <div>
            <span className="stat-value">{completedTasksCount}</span>
            <span className="stat-label">Tasks Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon leaves-bg">
            <Calendar size={24} color="#818cf8" />
          </div>
          <div>
            <span className="stat-value">{leaves.length}</span>
            <span className="stat-label">Total Leave Requests</span>
          </div>
        </div>
      </div>

      {error && <div className="portal-alert error"><AlertCircle size={18}/> {error}</div>}
      {success && <div className="portal-alert success"><Check size={18}/> {success}</div>}

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          <CheckSquare size={16} /> My Assigned Tasks ({tasks.length})
        </button>
        <button className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`} onClick={() => setActiveTab('apply')}>
          <Send size={16} /> Apply for Leave
        </button>
        <button className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
          <Calendar size={16} /> Leave History ({leaves.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="tab-content">
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="empty-msg">No tasks currently assigned to you.</p>
            ) : (
              tasks.map(t => (
                <div key={t.id} className="task-card">
                  <div className="task-header">
                    <h4>{t.title}</h4>
                    <span className={`priority-badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <p className="task-desc">{t.description || 'No description provided.'}</p>
                  
                  <div className="task-action-row">
                    <div className="meta-item">
                      <span>Assigned By: <strong>{t.createdBy?.name || 'Manager'}</strong></span>
                      {t.dueDate && <span className="due-date">Due: {t.dueDate}</span>}
                    </div>

                    <div className="status-updater">
                      <label>Update Status:</label>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className={`status-select ${t.status.toLowerCase()}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'apply' && (
        <div className="tab-content">
          <div className="form-card">
            <h3>Submit Leave Request</h3>
            <form onSubmit={handleSubmitLeave}>
              <div className="form-group">
                <label>Reason for Leave</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Attending family function / Medical appointment..."
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmittingLeave}>
                {isSubmittingLeave ? 'Submitting Leave...' : 'Submit Request to Manager'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="tab-content">
          <div className="leaves-list">
            {leaves.length === 0 ? (
              <p className="empty-msg">You have not submitted any leave requests yet.</p>
            ) : (
              leaves.map(l => (
                <div key={l.id} className="leave-card">
                  <div className="leave-header">
                    <div>
                      <span className="leave-dates">ðŸ“… {l.startDate} to {l.endDate}</span>
                    </div>
                    <span className={`status-badge ${l.status.toLowerCase()}`}>{l.status}</span>
                  </div>
                  <p className="leave-reason">"{l.reason}"</p>

                  <div className="reviewed-note">
                    <span>Reviewer: {l.reviewer?.name || 'Manager'}</span>
                    {l.managerComment && <p className="manager-comment">Comment: {l.managerComment}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

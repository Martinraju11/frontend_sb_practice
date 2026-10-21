import React, { useState, useEffect } from 'react';
import { getManagerTeam, createManagerTask, getManagerTasks, getManagerLeaves, reviewLeave } from '../api/api';
import { Users, PlusCircle, CheckSquare, Calendar, ShieldCheck, Check, X, AlertCircle } from 'lucide-react';
import './ManagerDashboard.css';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('team');
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [managerComment, setManagerComment] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [teamRes, tasksRes, leavesRes] = await Promise.all([
        getManagerTeam(),
        getManagerTasks(),
        getManagerLeaves()
      ]);
      setTeam(teamRes.data);
      setTasks(tasksRes.data);
      setLeaves(leavesRes.data);
    } catch (err) {
      setError('Failed to load manager dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmittingTask(true);

    try {
      const payload = {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        assignedToId: parseInt(taskAssignedTo, 10),
        dueDate: taskDueDate || null
      };

      await createManagerTask(payload);
      setSuccess('Task successfully assigned to team member!');
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleReviewLeave = async (leaveId, status) => {
    try {
      await reviewLeave(leaveId, {
        status,
        managerComment: managerComment || (status === 'APPROVED' ? 'Approved by manager' : 'Rejected by manager')
      });
      setSelectedLeaveId(null);
      setManagerComment('');
      setSuccess(`Leave request ${status.toLowerCase()}!`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review leave request');
    }
  };

  const pendingLeavesCount = leaves.filter(l => l.status === 'PENDING').length;
  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;

  if (loading) {
    return <div className="portal-loader">Loading Manager Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <div className="role-pill manager">
            <ShieldCheck size={16} />
            <span>MANAGER PORTAL</span>
          </div>
          <h2>Executive Team Dashboard</h2>
          <p>Oversee team members, assign tasks, and manage leave requests.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon team-bg">
            <Users size={24} color="#06b6d4" />
          </div>
          <div>
            <span className="stat-value">{team.length}</span>
            <span className="stat-label">Team Members</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon tasks-bg">
            <CheckSquare size={24} color="#818cf8" />
          </div>
          <div>
            <span className="stat-value">{tasks.length} <small>({completedTasksCount} done)</small></span>
            <span className="stat-label">Total Assigned Tasks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon leaves-bg">
            <Calendar size={24} color="#f59e0b" />
          </div>
          <div>
            <span className="stat-value">{pendingLeavesCount}</span>
            <span className="stat-label">Pending Leave Requests</span>
          </div>
        </div>
      </div>

      {error && <div className="portal-alert error"><AlertCircle size={18}/> {error}</div>}
      {success && <div className="portal-alert success"><Check size={18}/> {success}</div>}

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
          <Users size={16} /> My Team ({team.length})
        </button>
        <button className={`tab-btn ${activeTab === 'assign' ? 'active' : ''}`} onClick={() => setActiveTab('assign')}>
          <PlusCircle size={16} /> Assign Task
        </button>
        <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          <CheckSquare size={16} /> All Tasks ({tasks.length})
        </button>
        <button className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
          <Calendar size={16} /> Leave Approvals {pendingLeavesCount > 0 && <span className="badge-count">{pendingLeavesCount}</span>}
        </button>
      </div>

      {activeTab === 'team' && (
        <div className="tab-content">
          <div className="team-grid">
            {team.length === 0 ? (
              <p className="empty-msg">No direct reports assigned to your team yet.</p>
            ) : (
              team.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.name.charAt(0)}</div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <span className="member-email">{member.email}</span>
                    <div className="member-meta">
                      <span className="dept-tag">{member.department || 'Engineering'}</span>
                      <span className="gender-tag">{member.gender || 'MALE'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'assign' && (
        <div className="tab-content">
          <div className="form-card">
            <h3>Assign New Task to Employee</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Select Team Member</label>
                <select value={taskAssignedTo} onChange={e => setTaskAssignedTo(e.target.value)} required>
                  <option value="">-- Choose Employee --</option>
                  {team.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Task Title</label>
                <input type="text" placeholder="e.g. Implement OAuth2 Login" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Task Description</label>
                <textarea rows="3" placeholder="Provide detailed instructions for the task..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Priority</label>
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label>Due Date</label>
                  <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmittingTask}>
                {isSubmittingTask ? 'Assigning Task...' : 'Assign Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="tab-content">
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="empty-msg">No tasks created yet.</p>
            ) : (
              tasks.map(t => (
                <div key={t.id} className="task-card">
                  <div className="task-header">
                    <h4>{t.title}</h4>
                    <span className={`priority-badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <p className="task-desc">{t.description || 'No description provided.'}</p>
                  <div className="task-footer">
                    <span>Assigned to: <strong>{t.assignedTo?.name}</strong></span>
                    <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="tab-content">
          <div className="leaves-list">
            {leaves.length === 0 ? (
              <p className="empty-msg">No leave applications from team members.</p>
            ) : (
              leaves.map(l => (
                <div key={l.id} className="leave-card">
                  <div className="leave-header">
                    <div>
                      <h4>{l.employee?.name}</h4>
                      <span className="leave-dates">ðŸ“… {l.startDate} to {l.endDate}</span>
                    </div>
                    <span className={`status-badge ${l.status.toLowerCase()}`}>{l.status}</span>
                  </div>
                  <p className="leave-reason">"{l.reason}"</p>

                  {l.status === 'PENDING' ? (
                    <div className="review-actions">
                      <input
                        type="text"
                        placeholder="Optional comment..."
                        className="comment-input"
                        value={selectedLeaveId === l.id ? managerComment : ''}
                        onChange={e => { setSelectedLeaveId(l.id); setManagerComment(e.target.value); }}
                      />
                      <button className="approve-btn" onClick={() => handleReviewLeave(l.id, 'APPROVED')}>
                        <Check size={16} /> Approve
                      </button>
                      <button className="reject-btn" onClick={() => handleReviewLeave(l.id, 'REJECTED')}>
                        <X size={16} /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="reviewed-note">
                      <span>Comment: {l.managerComment || 'No comment added'}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

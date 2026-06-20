import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { FiUsers, FiCheckCircle, FiXCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

const API = 'http://localhost:5000/api';

export default function App() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ employeeName: '', employeeId: '', organization: '', status: 'Present' });
  const [activeTab, setActiveTab] = useState('mark');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API}/attendance`);
      setRecords(res.data);
    } catch { toast.error('Could not load records'); }
  };

  const handleSubmit = async () => {
    if (!form.employeeName || !form.employeeId || !form.organization) {
      toast.error('Please fill all fields'); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/attendance`, form);
      toast.success(`Attendance marked for ${form.employeeName}`);
      setForm({ employeeName: '', employeeId: '', organization: '', status: 'Present' });
      fetchRecords();
    } catch { toast.error('Failed to mark attendance'); }
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === todayStr);
  const presentCount = todayRecords.filter(r => r.status === 'Present').length;
  const absentCount = todayRecords.filter(r => r.status === 'Absent').length;

  const chartData = [
    { name: 'Present', value: presentCount, color: '#22c55e' },
    { name: 'Absent', value: absentCount, color: '#ef4444' },
    { name: 'Late', value: todayRecords.filter(r => r.status === 'Late').length, color: '#f59e0b' },
  ];

  return (
    <div className="app">
      <Toaster position="top-right" />
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">A</div>
            <div>
              <h1>AttendSync</h1>
              <p>Cloud Attendance Platform</p>
            </div>
          </div>
          <div className="header-date">
            <FiCalendar />
            <span>{new Date().toDateString()}</span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <FiUsers size={28} />
            <div>
              <h2>{todayRecords.length}</h2>
              <p>Total Today</p>
            </div>
          </div>
          <div className="stat-card stat-green">
            <FiCheckCircle size={28} />
            <div>
              <h2>{presentCount}</h2>
              <p>Present</p>
            </div>
          </div>
          <div className="stat-card stat-red">
            <FiXCircle size={28} />
            <div>
              <h2>{absentCount}</h2>
              <p>Absent</p>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <FiTrendingUp size={28} />
            <div>
              <h2>{todayRecords.length > 0 ? Math.round((presentCount / todayRecords.length) * 100) : 0}%</h2>
              <p>Attendance Rate</p>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="card">
            <div className="tabs">
              <button className={activeTab === 'mark' ? 'tab active' : 'tab'} onClick={() => setActiveTab('mark')}>Mark Attendance</button>
              <button className={activeTab === 'view' ? 'tab active' : 'tab'} onClick={() => setActiveTab('view')}>View Records</button>
            </div>

            {activeTab === 'mark' && (
              <div className="form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input placeholder="e.g. John Doe" value={form.employeeName} onChange={e => setForm({...form, employeeName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Employee / Student ID</label>
                  <input placeholder="e.g. EMP-001" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Organization</label>
                  <input placeholder="e.g. Pinnacle Labs" value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                  </select>
                </div>
                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : 'Mark Attendance'}
                </button>
              </div>
            )}

            {activeTab === 'view' && (
              <div className="records">
                {records.length === 0 ? <p className="empty">No records yet.</p> : records.slice().reverse().map(r => (
                  <div key={r.id} className="record-item">
                    <div className="record-avatar">{r.employeeName[0]}</div>
                    <div className="record-info">
                      <h4>{r.employeeName}</h4>
                      <p>{r.organization} · {r.date}</p>
                    </div>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card chart-card">
            <h3>Today's Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="powered">
              <span>Powered by</span>
              <strong>AWS DynamoDB</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
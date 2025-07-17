import { useEffect, useState } from 'react';
import GenderChart from '../components/GenderChart';
import AgeGroupChart from '../components/AgeGroupChart';
import RecordsPerFileChart from '../components/RecordsPerFileChart';
import CsvUploadForm from '../components/CsvUploadForm';
import UploadedFilesList from '../components/UploadedFilesList';
import FileRecordsViewer from '../components/FileRecordsViewer';
import NICsViewer from '../components/NICsViewer';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { logout } = useAuth();

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefreshDashboard = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, [logout]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>NIC Validation Dashboard</h2>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>

      <nav className="tab-buttons" role="tablist">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          aria-controls="dashboard-tab"
          id="dashboard-tab-btn"
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'allnics' ? 'active' : ''}
          onClick={() => setActiveTab('allnics')}
          role="tab"
          aria-selected={activeTab === 'allnics'}
          aria-controls="allnics-tab"
          id="allnics-tab-btn"
        >
          View NICs
        </button>
        
      </nav>

      <div className="line"></div>

      <main className="dashboard-main">
        {activeTab === 'dashboard' && (
          <section
            id="dashboard-tab"
            role="tabpanel"
            aria-labelledby="dashboard-tab-btn"
          >
            {error && <p className="error">{error}</p>}

            <section className="upload-section">
              <CsvUploadForm onUploadSuccess={handleRefreshDashboard} />
            </section>

            <section className="stats-section">
              <div className="stats-grid">
                <div className="card">Total Files: {stats?.totalFiles ?? '-'}</div>
                <div className="card">Total Records: {stats?.totalRecords ?? '-'}</div>
                <div className="card">Valid NICs: {stats?.validNICs ?? '-'}</div>
                <div className="card">Invalid NICs: {stats?.invalidNICs ?? '-'}</div>
              </div>
            </section>

            <section className="charts-section">
              <div className="charts-grid">
                <div className="chart">
                <GenderChart data={stats?.genderDistribution ?? []} />
                </div>
                <AgeGroupChart data={stats?.ageGroupDistribution ?? []} />
              </div>
              <RecordsPerFileChart data={stats?.recordsPerFile ?? []} />
            </section>

            <section className="files-list-section">
              <UploadedFilesList refreshTrigger={refreshTrigger} />
            </section>

            <section className="records-viewer-section">
              <FileRecordsViewer refreshTrigger={refreshTrigger} />
            </section>
          </section>
        )}

        {activeTab === 'allnics' && (
          <section
            id="allnics-tab"
            role="tabpanel"
            aria-labelledby="allnics-tab-btn"
          >
            <NICsViewer />
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

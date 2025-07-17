import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import './NICsViewer.css';

const NICsViewer = () => {
  const [nics, setNICs] = useState([]);
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [gender, setGender] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/csv/files', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) return logout();

        const data = await res.json();
        setCsvFiles(data);
      } catch (err) {
        setError('Failed to load CSV file list');
      }
    };
    fetchFiles();
  }, [logout]);

  const fetchNICs = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (gender) params.append('gender', gender);
      if (ageMin) params.append('age_min', ageMin);
      if (ageMax) params.append('age_max', ageMax);
      if (selectedFileIds.length > 0) {
        selectedFileIds.forEach((id) => params.append('file_id', id));
      }

      const res = await fetch(`http://localhost:5001/api/csv/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch NICs');
      setNICs(data);
    } catch (err) {
      setError(err.message);
      setNICs([]);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (gender) params.append('gender', gender);
      if (ageMin) params.append('age_min', ageMin);
      if (ageMax) params.append('age_max', ageMax);
      if (selectedFileIds.length > 0) {
        selectedFileIds.forEach((id) => params.append('file_id', id));
      }

      params.append('format', format);

      const res = await fetch(`http://localhost:5001/api/csv/report/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) return logout();
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nics_report.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  return (
    <div className="nics-viewer">
      <h3>View Extracted NICs</h3>

      <div className="filters">
        <div>
          <label>CSV File</label>
          <Select
            options={csvFiles.map(file => ({ value: file.id, label: file.filename }))}
            isMulti
            value={selectedFileIds.map(id => {
              const file = csvFiles.find(f => f.id === id);
              return { value: id, label: file?.filename || id };
            })}
            onChange={selected => setSelectedFileIds(selected.map(s => s.value))}
            placeholder="Select one or more files"
            className="select-box"
          />
        </div>

        <div>
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label>Age Range</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              placeholder="Min"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button onClick={fetchNICs}>Apply Filters</button>
        </div>
      </div>

      <div className="export-buttons">
        <button onClick={() => exportReport('csv')}>Export CSV</button>
        <button onClick={() => exportReport('excel')}>Export Excel</button>
        <button onClick={() => exportReport('pdf')}>Export PDF</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading NICs...</p>
      ) : (
        <div className="nics-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NIC</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Age</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {nics.length > 0 ? (
                nics.map(nic => (
                  <tr key={nic.id}>
                    <td>{nic.id}</td>
                    <td>{nic.nic}</td>
                    <td>{nic.dob ? nic.dob.split('T')[0]:''}</td>
                    <td>{nic.gender}</td>
                    <td>{nic.age}</td>
                    <td>{nic.filename}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6">No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NICsViewer;
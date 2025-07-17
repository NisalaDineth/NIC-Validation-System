import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import './FileRecordsViewer.css';

const FileRecordsViewer = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/csv/files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();

      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError('Failed to load files');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [logout, refreshTrigger]);

  useEffect(() => {
    if (!selectedFileId) return; // If no file is selected, do nothing

    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/csv/records/${selectedFileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) return logout();

        const data = await res.json();
        setRecords(data);
      } catch (err) {
        setError('Failed to load records');
      }
    };
    fetchRecords();
  }, [selectedFileId, logout]);

  const renderRawData = (raw) => {
    if (typeof raw === 'object' && raw !== null) {
      return (
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {Object.entries(raw).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {String(value)}
            </li>
          ))}
        </ul>
      );
    } else {
      return String(raw);
    }
  };

  return (
    <div className="file-records-viewer">
      <h3>View Records by File</h3>
      {error && <p className="error">{error}</p>}

<select value={selectedFileId} onChange={(e) => setSelectedFileId(e.target.value)}>
  <option value="">Select a file (latest 8) </option>
  {files.slice(0, 8).map((file) => (
    <option key={file.id} value={file.id}>
      {file.filename}
    </option>
  ))}
</select>

      {records.length > 0 ? (
        <div className="records-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NIC</th>
                <th>Raw Data</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.nic || 'N/A'}</td>
                  <td>{renderRawData(record.raw_data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedFileId && <p>No records found for this file.</p>
      )}
    </div>
  );
};

FileRecordsViewer.propTypes = {
  refreshTrigger: PropTypes.number,
};

export default FileRecordsViewer;
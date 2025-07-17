import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import './UploadedFilesList.css';

const UploadedFilesList = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
      if (!res.ok) throw new Error(data.message || 'Failed to load files');
      setFiles(data);
      setFilteredFiles(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [logout, refreshTrigger]);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = files.filter(file =>
      file.filename.toLowerCase().includes(value)
    );
    setFilteredFiles(filtered);
  };

  return (
    <div className="files-list">
      <h3>Uploaded CSV Files</h3>
      <input
        type="text"
        placeholder="Search by filename..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      {error && <p className="error">{error}</p>}

      {filteredFiles.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Uploaded At</th>
              <th>Records</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file.id}>
                <td>{file.filename}</td>
                <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                <td>{file.record_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
};

UploadedFilesList.propTypes = {
  refreshTrigger: PropTypes.number,
};

export default UploadedFilesList;

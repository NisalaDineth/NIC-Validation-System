import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiUpload, FiX } from 'react-icons/fi';  // Import the icons you want to use
import { useAuth } from '../context/AuthContext';
import './CsvUploadForm.css';

const CsvUploadForm = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { logout } = useAuth();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files).slice(0, 4)); // max 4 files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (files.length === 0) {
      setError('Please select at least one CSV file.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/csv/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) return logout();

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setMessage(data.message);
      setFiles([]);

      // Clear the file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

      // Trigger dashboard refresh
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="upload-form">
      <h3>Upload CSV Files</h3>
      <form onSubmit={handleSubmit}>
        <label className="custom-file-input" htmlFor="file-upload">
          <FiUpload className="upload-icon" />
          <span className="custom-file-label">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : 'Choose CSV Files'}
          </span>
          <input
            id="file-upload"
            type="file"
            name="files"
            multiple
            accept=".csv"
            onChange={handleFileChange}
          />
        </label>

        {/* List selected files with remove buttons */}
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index}>
              {file.name}
              <button
                type="button"
                className="remove-btn"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
                aria-label="Remove file"
              >
                <FiX className="remove-icon" />
              </button>
            </li>
          ))}
        </ul>

        <button type="submit">Upload</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

CsvUploadForm.propTypes = {
  onUploadSuccess: PropTypes.func,
};

export default CsvUploadForm;

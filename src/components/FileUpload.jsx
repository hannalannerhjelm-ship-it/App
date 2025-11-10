import { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onQuestionsGenerated, onError, loading, setLoading }) {
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('SBA');
  const [numQuestions, setNumQuestions] = useState(5);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      onError('Vänligen välj en fil först');
      return;
    }

    setLoading(true);
    onError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionType', questionType);
    formData.append('numQuestions', numQuestions);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      onQuestionsGenerated(data);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <form onSubmit={handleSubmit}>
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            accept=".txt,.pdf,.docx,.doc"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="file-input">
            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">📁</span>
                <p>Dra och släpp en fil här eller klicka för att välja</p>
                <p className="file-types">Stödda format: .txt, .pdf, .docx</p>
              </div>
            )}
          </label>
        </div>

        <div className="form-options">
          <div className="form-group">
            <label htmlFor="question-type">Frågetyp:</label>
            <select
              id="question-type"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              disabled={loading}
            >
              <option value="SBA">SBA (Single Best Answer)</option>
              <option value="MCQ">MCQ (Multiple Choice Questions)</option>
            </select>
            <p className="help-text">
              {questionType === 'SBA'
                ? 'Endast ett rätt svar per fråga'
                : 'Kan ha flera rätta svar per fråga'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="num-questions">Antal frågor:</label>
            <input
              type="number"
              id="num-questions"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading || !file}
        >
          {loading ? 'Genererar frågor...' : 'Generera Frågor'}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;

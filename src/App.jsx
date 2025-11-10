import { useState } from 'react';
import FileUpload from './components/FileUpload';
import QuestionDisplay from './components/QuestionDisplay';
import './App.css';

function App() {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuestionsGenerated = (data) => {
    setQuestions(data);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setQuestions(null);
  };

  const handleReset = () => {
    setQuestions(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🥋 Karate Läromaterial App</h1>
        <p>Ladda upp läromaterial och få färdiga testfrågor</p>
      </header>

      <main className="app-main">
        {!questions ? (
          <FileUpload
            onQuestionsGenerated={handleQuestionsGenerated}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <QuestionDisplay
            questions={questions}
            onReset={handleReset}
          />
        )}

        {error && (
          <div className="error-message">
            <h3>Ett fel uppstod</h3>
            <p>{error}</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Genererar frågor enligt SBA (Single Best Answer) och MCQ (Multiple Choice Questions) standarder</p>
      </footer>
    </div>
  );
}

export default App;

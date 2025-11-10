import { useState } from 'react';
import './QuestionDisplay.css';

function QuestionDisplay({ questions, onReset }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [score, setScore] = useState(null);

  const questionList = questions.questions || [];
  const isSBA = questions.questionType === 'SBA';

  const handleAnswerSelect = (questionIndex, answer) => {
    if (isSBA) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: [answer]
      });
    } else {
      const current = selectedAnswers[questionIndex] || [];
      const newAnswers = current.includes(answer)
        ? current.filter(a => a !== answer)
        : [...current, answer];

      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: newAnswers
      });
    }
  };

  const checkAnswer = (questionIndex) => {
    setShowExplanation({
      ...showExplanation,
      [questionIndex]: true
    });
  };

  const isCorrect = (questionIndex) => {
    const question = questionList[questionIndex];
    const selected = selectedAnswers[questionIndex] || [];

    if (isSBA) {
      return selected[0] === question.correctAnswer;
    } else {
      const correct = question.correctAnswers || [];
      return selected.length === correct.length &&
             selected.every(a => correct.includes(a));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questionList.forEach((_, index) => {
      if (isCorrect(index)) correct++;
    });
    setScore({ correct, total: questionList.length });
  };

  const nextQuestion = () => {
    if (currentQuestion < questionList.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const exportQuestions = () => {
    const text = questionList.map((q, idx) => {
      const correctInfo = isSBA
        ? `Rätt svar: ${q.correctAnswer}`
        : `Rätta svar: ${q.correctAnswers.join(', ')}`;

      return `Fråga ${idx + 1}: ${q.question}\n\n${q.options.join('\n')}\n\n${correctInfo}\n\nFörklaring: ${q.explanation}\n\n---\n`;
    }).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karate-fragor-${questions.questionType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (questionList.length === 0) {
    return (
      <div className="question-display">
        <p>Inga frågor kunde genereras.</p>
        <button onClick={onReset} className="reset-button">Försök igen</button>
      </div>
    );
  }

  const question = questionList[currentQuestion];
  const isAnswered = showExplanation[currentQuestion];
  const userAnswers = selectedAnswers[currentQuestion] || [];

  return (
    <div className="question-display">
      <div className="question-header">
        <h2>{questions.questionType} Frågor</h2>
        <span className="question-counter">
          Fråga {currentQuestion + 1} av {questionList.length}
        </span>
      </div>

      {score && (
        <div className="score-display">
          <h3>Resultat</h3>
          <p className="score-text">
            Du fick {score.correct} av {score.total} rätt
            ({Math.round((score.correct / score.total) * 100)}%)
          </p>
        </div>
      )}

      <div className="question-card">
        <h3 className="question-text">{question.question}</h3>

        <div className="options-list">
          {question.options.map((option, idx) => {
            const letter = option.charAt(0);
            const isSelected = userAnswers.includes(letter);
            const isCorrectAnswer = isSBA
              ? question.correctAnswer === letter
              : (question.correctAnswers || []).includes(letter);

            let className = 'option';
            if (isAnswered) {
              if (isCorrectAnswer) className += ' correct';
              if (isSelected && !isCorrectAnswer) className += ' incorrect';
            } else if (isSelected) {
              className += ' selected';
            }

            return (
              <button
                key={idx}
                className={className}
                onClick={() => handleAnswerSelect(currentQuestion, letter)}
                disabled={isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {!isAnswered && userAnswers.length > 0 && (
          <button
            className="check-button"
            onClick={() => checkAnswer(currentQuestion)}
          >
            Kontrollera Svar
          </button>
        )}

        {isAnswered && (
          <div className={`explanation ${isCorrect(currentQuestion) ? 'correct-answer' : 'incorrect-answer'}`}>
            <h4>
              {isCorrect(currentQuestion) ? '✓ Rätt!' : '✗ Fel'}
            </h4>
            <p>{question.explanation}</p>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="nav-button"
        >
          ← Föregående
        </button>

        {currentQuestion === questionList.length - 1 && !score && (
          <button
            onClick={calculateScore}
            className="score-button"
          >
            Visa Resultat
          </button>
        )}

        <button
          onClick={nextQuestion}
          disabled={currentQuestion === questionList.length - 1}
          className="nav-button"
        >
          Nästa →
        </button>
      </div>

      <div className="action-buttons">
        <button onClick={exportQuestions} className="export-button">
          📥 Exportera Frågor
        </button>
        <button onClick={onReset} className="reset-button">
          🔄 Ladda upp ny fil
        </button>
      </div>
    </div>
  );
}

export default QuestionDisplay;

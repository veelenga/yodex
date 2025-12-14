import MarkdownContent from '../MarkdownContent';

export default function QuizExplanation({ explanation, className = '' }) {
  if (!explanation) return null;

  return (
    <div className={`explanation-box ${className}`}>
      <div className="explanation-title">Explanation</div>
      <div className="explanation-content">
        <MarkdownContent content={explanation} />
      </div>
    </div>
  );
}

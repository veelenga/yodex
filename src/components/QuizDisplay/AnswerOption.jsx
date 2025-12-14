import { CheckCircle2, XCircle } from 'lucide-react';
import MarkdownContent from '../MarkdownContent';

const OPTION_LABEL_CHAR_CODE_START = 65;

export default function AnswerOption({
  index,
  content,
  optionClassName,
  labelClassName,
  showCorrect,
  showIncorrect,
  disabled,
  onSelect,
  variant = 'mobile',
}) {
  const optionLabel = String.fromCharCode(OPTION_LABEL_CHAR_CODE_START + index);
  const isMobile = variant === 'mobile';

  const iconSize = isMobile ? 'w-6 h-6' : 'w-7 h-7';
  const containerClasses = isMobile
    ? 'flex items-center gap-2'
    : 'flex items-center gap-3';
  const textClasses = isMobile
    ? 'text-sm leading-normal'
    : 'text-sm leading-relaxed';

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={disabled}
      className={optionClassName}
    >
      <div className={containerClasses}>
        <div className="flex-shrink-0">
          {showCorrect ? (
            <CheckCircle2 className={`${iconSize} text-green-600`} />
          ) : showIncorrect ? (
            <XCircle className={`${iconSize} text-red-600`} />
          ) : (
            <div className={labelClassName}>
              {optionLabel}
            </div>
          )}
        </div>
        <div className="flex-1 text-left">
          <MarkdownContent content={content} className={textClasses} />
        </div>
      </div>
    </button>
  );
}

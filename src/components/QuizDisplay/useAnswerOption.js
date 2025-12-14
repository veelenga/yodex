const OPTION_CLASSES = {
  base: 'answer-option',
  correct: 'answer-option-correct',
  incorrect: 'answer-option-incorrect',
  selected: 'answer-option-selected',
  default: 'answer-option-default',
};

const LABEL_CLASSES = {
  base: 'answer-label',
  selected: 'answer-label-selected',
  default: 'answer-label-default',
};

export function useAnswerOption(selectedAnswer, correctIndex) {
  const getOptionState = (index) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = index === correctIndex;
    const isAnswered = selectedAnswer !== null;
    const showCorrect = isAnswered && isCorrect;
    const showIncorrect = isAnswered && isSelected && !isCorrect;

    return { isSelected, isCorrect, isAnswered, showCorrect, showIncorrect };
  };

  const getOptionClassName = (index) => {
    const { showCorrect, showIncorrect, isSelected } = getOptionState(index);

    if (showCorrect) return `${OPTION_CLASSES.base} ${OPTION_CLASSES.correct}`;
    if (showIncorrect) return `${OPTION_CLASSES.base} ${OPTION_CLASSES.incorrect}`;
    if (isSelected) return `${OPTION_CLASSES.base} ${OPTION_CLASSES.selected}`;
    return `${OPTION_CLASSES.base} ${OPTION_CLASSES.default}`;
  };

  const getLabelClassName = (index) => {
    const { showCorrect, showIncorrect, isSelected } = getOptionState(index);

    if (showCorrect || showIncorrect) return LABEL_CLASSES.base;
    if (isSelected) return `${LABEL_CLASSES.base} ${LABEL_CLASSES.selected}`;
    return `${LABEL_CLASSES.base} ${LABEL_CLASSES.default}`;
  };

  return {
    getOptionState,
    getOptionClassName,
    getLabelClassName,
    isAnswered: selectedAnswer !== null,
  };
}

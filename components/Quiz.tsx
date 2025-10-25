
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface Props {
  data: QuizQuestion;
}

const Quiz: React.FC<Props> = ({ data }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
    }
  };

  const selectedOption = data.options.find(o => o.id === selectedAnswer);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-200 mt-20 max-w-xl mx-auto font-sans">
      <h3 className="text-2xl font-bold mb-6 text-stone-800">Check your understanding</h3>
      <p className="text-lg mb-6 font-serif">{data.question}</p>

      <div className="space-y-3 mb-8">
        {data.options.map((option) => {
          let itemClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
          if (isSubmitted) {
            if (option.correct) itemClass += "border-green-500 bg-green-50 text-green-900 font-bold";
            else if (selectedAnswer === option.id) itemClass += "border-red-300 bg-red-50 text-red-900 opacity-70";
            else itemClass += "border-stone-200 text-stone-400 opacity-50";
          } else {
             if (selectedAnswer === option.id) itemClass += "border-sky-500 bg-sky-50 text-sky-900";
             else itemClass += "border-stone-200 hover:border-stone-300 hover:bg-stone-50";
          }

          return (
            <button
              key={option.id}
              onClick={() => !isSubmitted && setSelectedAnswer(option.id)}
              disabled={isSubmitted}
              className={itemClass}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="px-6 py-3 bg-stone-900 text-white font-bold rounded-full disabled:opacity-50 hover:bg-stone-700 transition-colors"
        >
          Submit Answer
        </button>
      ) : (
        <div className={`p-4 rounded-lg ${selectedOption?.correct ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'}`}>
          <p>
              <strong>{selectedOption?.correct ? 'Correct!' : 'Not quite.'}</strong>{' '}
              {selectedOption?.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default Quiz;

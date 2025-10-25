import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';

interface Props {
  data: QuizQuestion;
}

const Quiz: React.FC<Props> = ({ data }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
    }
  };

  const selectedOption = data.options.find(o => o.id === selectedAnswer);

  // Trigger confetti when correct answer is submitted
  useEffect(() => {
    if (isSubmitted && selectedOption?.correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [isSubmitted, selectedOption]);

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                width: '10px',
                height: '10px',
                backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes confetti {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            animation: confetti 3s ease-in forwards;
          }
        `}
      </style>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-200 mt-20 max-w-xl mx-auto font-sans">
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
                onClick={() => {
                  if (!isSubmitted) {
                    setSelectedAnswer(option.id);
                    setIsSubmitted(true);
                  }
                }}
                disabled={isSubmitted}
                className={itemClass}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        {isSubmitted && (
          <div className={`p-4 rounded-lg ${selectedOption?.correct ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'}`}>
            <p>
              <strong>{selectedOption?.correct ? 'Correct!' : 'Not quite.'}</strong>{' '}
              {selectedOption?.explanation}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Quiz;

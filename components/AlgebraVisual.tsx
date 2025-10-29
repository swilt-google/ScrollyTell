
import React, { useState, useEffect, useRef } from 'react';
import { AlgebraVisualState, AlgebraTerm, AlgebraSequenceFrame, AlgebraInteraction } from '../types';
import confetti from 'canvas-confetti';

interface Props {
  state: AlgebraVisualState;
}

const AlgebraVisual: React.FC<Props> = ({ state }) => {
  const { 
      richEquations: initialRichEquations, 
      annotation: initialAnnotation, 
      sequence,
      equations, highlightTerm, interaction: initialInteraction 
  } = state;

  // -- Sequencing Logic --
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const sequenceTimer = useRef<number | null>(null);

  // Determine current frame based on sequence or initial state
  let currentFrame: AlgebraSequenceFrame = {
      richEquations: initialRichEquations || [],
      annotation: initialAnnotation
  };

  if (sequence && sequence.length > 0) {
      currentFrame = sequence[sequenceIndex] || sequence[sequence.length - 1];
  }

  useEffect(() => {
      // Reset sequence when state changes entirely
      setSequenceIndex(0);
  }, [state]);

  useEffect(() => {
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);

      if (sequence && sequenceIndex < sequence.length - 1) {
          const duration = sequence[sequenceIndex].duration || 2000;
          sequenceTimer.current = window.setTimeout(() => {
              setSequenceIndex(prev => prev + 1);
          }, duration);
      }
      return () => { if (sequenceTimer.current) clearTimeout(sequenceTimer.current); };
  }, [sequence, sequenceIndex]);


  // -- Interaction State --
    const [activeInteraction, setActiveInteraction] = useState<AlgebraInteraction | undefined>(initialInteraction);
    const [currentEquations, setCurrentEquations] = useState(initialRichEquations);

  const [isSolved, setIsSolved] = useState(false);
  const [showSolvedState, setShowSolvedState] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputCorrect, setInputCorrect] = useState(false);

    // Command Input State
    const [commandInputValue, setCommandInputValue] = useState("");
    const [commandInputCorrect, setCommandInputCorrect] = useState(false);
    const [commandInputError, setCommandInputError] = useState(false);

  // Currently being dragged item ID
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
      setActiveInteraction(initialInteraction);
      setCurrentEquations(initialRichEquations);
      setIsSolved(false);
      setShowSolvedState(false);
      setSelectedChoice(null);
      setInputValue("");
      setInputCorrect(false);
      setCommandInputValue("");
      setCommandInputCorrect(false);
      setCommandInputError(false);
      setDraggedId(null);
  }, [state]);

    // If solved, trigger the transition to show the solved state OR next interaction after a brief delay
  useEffect(() => {
      if (isSolved && activeInteraction?.solvedEquations) {
          const timer = setTimeout(() => {
              if (activeInteraction.nextInteraction) {
                  // Chained interaction: transition to next
                  setCurrentEquations(activeInteraction.solvedEquations);
                  setActiveInteraction(activeInteraction.nextInteraction);
                  setIsSolved(false);
                  // Reset input states
                  setInputValue("");
                  setInputCorrect(false);
                  setCommandInputValue("");
                  setCommandInputCorrect(false);
                  setCommandInputError(false);
              } else {
              // Final interaction: show solved state
                  setShowSolvedState(true);
              }
          }, 800); // Wait for the immediate drop feedback before fading to new state
          return () => clearTimeout(timer);
      }
  }, [isSolved, activeInteraction]);

  // --- Legacy String Renderer ---
  const renderLegacyEquation = (eq: string) => {
      if (!highlightTerm || !eq.includes(highlightTerm)) return eq;
      const parts = eq.split(highlightTerm);
      return (
          <>
            {parts[0]}
            <span className="bg-sky-100 px-1 rounded-md mx-0.5 inline-block transform transition-all duration-500 scale-110 font-bold text-sky-900 border-b-2 border-sky-300">
                {highlightTerm}
            </span>
            {parts[1]}
          </>
      )
  };

  // --- Rich Term Renderer ---
  const renderTerm = (term: AlgebraTerm, lineIndex: number, termIndex: number) => {
      // Common base classes for all terms
      const baseClasses = "mx-0.5 inline-block transition-all duration-700 relative font-bold";

      switch (term.type) {
          case 'text':
               let textAnim = "";
               if (term.animation === 'fade-out') textAnim = "opacity-0 scale-95";
               if (term.animation === 'slide-out-left') textAnim = "animate-out slide-out-to-left fade-out absolute";
               if (term.animation === 'fly-in') textAnim = "animate-in slide-in-from-bottom-8 fade-in duration-700";
              return <span key={`${lineIndex}-${termIndex}`} className={`${baseClasses} ${textAnim}`}>{term.value}</span>;
          
          case 'highlight':
              let animClass = "";
              if (term.animation === 'pulse') animClass = "animate-pulse";
              if (term.animation === 'fly-in') animClass = "animate-in slide-in-from-bottom-8 fade-in duration-700";
              if (term.animation === 'slide-in-top') animClass = "animate-in slide-in-from-top-12 fade-in duration-1000 z-10";
              if (term.animation === 'slide-out-left') animClass = "animate-out slide-out-to-left-8 fade-out duration-700 absolute";
              if (term.animation === 'fade-out') animClass = "opacity-0 scale-90";
              
              return (
                  <span key={`${lineIndex}-${termIndex}`} className={`${baseClasses} px-1 rounded-md font-bold text-stone-900 ${animClass}`} style={{ backgroundColor: term.color || '#fef08a' }}>
                      {term.value}
                  </span>
              );

          case 'draggable':
             const isBeingDragged = draggedId === term.id;
             // If we have solved it, we might want to hide these or they naturally fade out due to parent container
             return (
                 <span 
                    key={termIndex}
                    draggable={!isSolved}
                    onDragStart={(e) => {
                        setDraggedId(term.id);
                        e.dataTransfer.setData('text/plain', term.id);
                        e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    className={`mx-1 px-3 py-1 ${term.color || 'bg-sky-500'} text-white rounded-lg font-bold cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all inline-block ${isBeingDragged || isSolved ? 'opacity-50 scale-95' : ''}`}
                 >
                     {term.value}
                 </span>
             );

          case 'drop-target':
              // Check if the currently dragged item is accepted by this target
              const isAccepting = draggedId && term.accepts?.includes(draggedId);

              return (
                  <span 
                    key={termIndex}
                    onDragOver={(e) => {
                        if (isAccepting) e.preventDefault(); // Only allow drop if accepted
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        const droppedId = e.dataTransfer.getData('text/plain');
                        if (term.accepts?.includes(droppedId)) {
                             setIsSolved(true);
                            activeInteraction?.onDragComplete?.();
                        }
                    }}
                    className={`mx-1 px-3 py-1 border-2 border-dashed rounded-lg inline-block transition-all duration-300 
                        ${isSolved ? 'bg-green-100 border-green-400 text-green-800 scale-110' : ''}
                        ${!isSolved && isAccepting ? 'bg-sky-100 border-sky-400 scale-110' : 'border-stone-300 text-stone-400'}
                    `}
                  >
                      {term.value}
                  </span>
              );
          
          case 'input':
              return (
                  <input
                    key={termIndex}
                    type="text"
                    value={inputCorrect ? term.correctValue : inputValue}
                    disabled={inputCorrect}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (e.target.value === term.correctValue) setInputCorrect(true);
                    }}
                    className={`mx-2 w-16 text-center p-2 rounded-md border-2 outline-none font-bold transition-all ${inputCorrect ? 'border-green-500 bg-green-50 text-green-800' : 'border-stone-300 focus:border-sky-500'}`}
                    placeholder={term.placeholder || "?"}
                  />
              );

          default:
              return null;
      }
  };

    // Decide what to render: the sequence frame, or the solved state OR current activeInteraction state
    const equationsToRender = showSolvedState && activeInteraction?.solvedEquations
        ? activeInteraction.solvedEquations
        : (sequence && sequence.length > 0 ? currentFrame.richEquations : currentEquations);

    const annotationToRender = showSolvedState && activeInteraction?.successAnnotation
        ? activeInteraction.successAnnotation
        : (activeInteraction?.type === 'command-input' ? "" : (currentFrame.annotation || initialAnnotation));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 rounded-3xl shadow-inner p-4 md:p-8 transition-all duration-500 font-serif relative overflow-hidden">
      
      {/* Equations Area */}
      {/* Increased max-w to allow single line for longer combined equations */}
      <div className={`space-y-4 text-center z-10 min-h-[200px] flex flex-col justify-center items-center w-full max-w-4xl transition-opacity duration-700 ${isSolved && !showSolvedState ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        {equationsToRender ? (
            equationsToRender.map((line, i) => (
                // Removed flex-wrap to force single line, added whitespace-nowrap just in case
                <div key={i} className="text-4xl md:text-5xl lg:text-6xl text-stone-700 flex items-center justify-center flex-nowrap whitespace-nowrap leading-tight transition-all duration-700 h-20 w-full relative">
                    {line.map((term, j) => renderTerm(term, i, j))}
                </div>
            ))
        ) : (
            equations?.map((eq, i) => (
                <div key={i} className="text-4xl md:text-6xl text-stone-700 transition-all">
                    {renderLegacyEquation(eq)}
                </div>
            ))
        )}
      </div>

      {/* Annotation */}
      <div className={`mt-8 text-lg text-sky-700 font-sans font-bold uppercase tracking-widest transition-all duration-500 ${annotationToRender ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {annotationToRender || "..."}
      </div>

      {/* Interaction Area: Choices */}
          {activeInteraction?.type === 'choice' && activeInteraction.choices && (
          <div className="mt-12 flex gap-4 flex-wrap justify-center z-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards">
                  {activeInteraction.choices.map(choice => (
                  <div key={choice.id} className="flex flex-col items-center">
                    <button 
                        onClick={() => setSelectedChoice(choice.id)}
                        className={`px-6 py-3 rounded-full font-bold text-lg transition-all border-2 ${selectedChoice === choice.id ? (choice.isCorrect ? "bg-green-500 text-white border-green-500" : "bg-red-100 text-red-800 border-red-300") : "bg-white border-stone-200 hover:border-sky-500 hover:text-sky-600 text-stone-700 shadow-sm"}`}
                    >
                        {choice.text}
                    </button>
                    {selectedChoice === choice.id && choice.feedback && (
                        <div className={`mt-2 text-sm font-sans font-bold ${choice.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>{choice.feedback}</div>
                    )}
                  </div>
              ))}
          </div>
      )}

          {/* Interaction Area: Command Input */}
          {activeInteraction?.type === 'command-input' && !showSolvedState && (
              <div className={`mt-12 flex flex-col items-center z-20 transition-all duration-500 ${isSolved ? 'opacity-0 translate-y-4' : 'animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards'}`}>
                  {activeInteraction.title && (
                      <div className="mb-2 text-xl font-bold text-sky-600">{activeInteraction.title}</div>
                  )}
                  {activeInteraction.commandPrompt && (
                      <div className="mb-4 text-lg font-bold text-stone-600">{activeInteraction.commandPrompt}</div>
                  )}
                  <div className="flex items-center gap-2">
                      <input
                          type="text"
                          value={commandInputValue}
                          disabled={isSolved}
                          onChange={(e) => {
                              const val = e.target.value;
                              setCommandInputValue(val);
                              setCommandInputError(false);
                          }}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  if (activeInteraction?.correctCommand && commandInputValue.trim().toLowerCase() === activeInteraction.correctCommand.toLowerCase()) {
                                      setCommandInputCorrect(true);
                                      setIsSolved(true);
                                  } else {
                                      setCommandInputError(true);
                                  }
                              }
                          }}
                          className={`px-4 py-2 text-xl text-center rounded-lg border-2 outline-none font-bold transition-all w-48
                          ${commandInputCorrect ? 'border-green-500 bg-green-50 text-green-800' :
                                  commandInputError ? 'border-red-500 bg-red-50 text-red-800' :
                                      'border-stone-300 focus:border-sky-500 text-stone-800'}
                      `}
                          placeholder="e.g. +5, /2"
                      />
                      <button
                          onClick={() => {
                              if (activeInteraction?.correctCommand && commandInputValue.trim().toLowerCase() === activeInteraction.correctCommand.toLowerCase()) {
                                  setCommandInputCorrect(true);
                                  setIsSolved(true);
                              } else {
                                  setCommandInputError(true);
                              }
                          }}
                          disabled={isSolved}
                          className="px-4 py-2 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors disabled:opacity-50"
                      >
                          Apply
                      </button>
                  </div>
              </div>
          )}

      {/* Input Success Message */}
          {activeInteraction?.type === 'fill-input' && inputCorrect && (
          <div className="absolute bottom-12 text-2xl font-bold text-green-600 animate-bounce">Correct!</div>
      )}

    </div>
  );
};

export default AlgebraVisual;
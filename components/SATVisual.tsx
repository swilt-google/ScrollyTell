import React, { useState, useEffect, useRef } from 'react';
import { SATVisualState } from '../types';
import confetti from 'canvas-confetti';

interface Props {
    state: SATVisualState;
    inputValue?: string;
    onInputChange?: (value: string) => void;
}

const SATVisual: React.FC<Props> = ({ state, inputValue: externalInputValue, onInputChange }) => {
    const {
        text,
        highlightedWord,
        highlightFirstOnly,
        obscuredWord,
        showInput,
        showInputAsStatic,
        inputPlaceholder,
        choices,
        showConfetti,
        choicesState = 'initial',
        cyclingWords,
        cyclingTarget,
        flashingWord,
        warningChoice,
        layout = 'standard',
        revealChoicesOnInput,
        inputAnnotation,
        inputInstruction,
        fadeSecondLine
    } = state;

    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [currentCyclingWordIndex, setCurrentCyclingWordIndex] = useState(0);
    const [isFlashingVisible, setIsFlashingVisible] = useState(true);
    const [localChoicesState, setLocalChoicesState] = useState(choicesState);

    // Use external input value if provided, otherwise use local state
    const inputValue = externalInputValue !== undefined ? externalInputValue : '';

    // Sync local choices state with prop
    useEffect(() => {
        setLocalChoicesState(choicesState);
    }, [choicesState]);

    // Handle input change and potential choice reveal
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (onInputChange) {
            onInputChange(newValue);
        }
        if (revealChoicesOnInput && newValue.length > 0 && localChoicesState === 'initial') {
            setLocalChoicesState('revealed');
        }
    };

    // Cycling words animation (slower for slot machine effect)
    useEffect(() => {
        if (cyclingWords && cyclingWords.length > 0) {
            const interval = setInterval(() => {
                setCurrentCyclingWordIndex(prev => (prev + 1) % cyclingWords.length);
            }, 1500); // Slower transition (1.5 seconds)
            return () => clearInterval(interval);
        }
    }, [cyclingWords]);

    // Flashing animation
    useEffect(() => {
        if (flashingWord) {
            const interval = setInterval(() => {
                setIsFlashingVisible(prev => !prev);
            }, 400);
            return () => clearInterval(interval);
        } else {
            setIsFlashingVisible(true);
        }
    }, [flashingWord]);

    // Reset local state when the state object changes significantly
    useEffect(() => {
        // Input value is now managed externally, no need to reset
        setSelectedChoice(null);
        setCurrentCyclingWordIndex(0);
        setIsFlashingVisible(true);
        setLocalChoicesState(choicesState);
    }, [text, obscuredWord, choices, cyclingWords, flashingWord, choicesState]);

    // Trigger confetti when requested
    useEffect(() => {
        if (showConfetti) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [showConfetti]);

    const renderText = () => {
        if (!text) return null;

        // Extract working text - use only first line if fadeSecondLine is true
        let workingText = text;
        let secondLine: string | null = null;
        if (fadeSecondLine && text.includes('\n')) {
            const lines = text.split('\n');
            workingText = lines[0];
            secondLine = lines[1];
        }

        let renderedTextNode: React.ReactNode = workingText;

        // Helper to split and wrap text (only wraps first occurrence)
        const wrapWord = (fullText: string, target: string, wrapper: (word: string) => React.ReactNode): React.ReactNode => {
            if (!fullText.includes(target)) return fullText;
            const index = fullText.indexOf(target);
            const before = fullText.substring(0, index);
            const after = fullText.substring(index + target.length);
            return (
                <>
                    {before}
                    {wrapper(target)}
                    {after}
                </>
            );
        };

        if (cyclingWords && cyclingTarget && workingText.includes(cyclingTarget)) {
            renderedTextNode = wrapWord(workingText, cyclingTarget, () => (
                <span className="inline-block relative min-w-[150px] text-center align-baseline underline decoration-2 underline-offset-4 text-sky-600">
                    <span className="inline-block h-[1.2em] overflow-hidden relative align-top">
                        <span
                            className="flex flex-col transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateY(-${currentCyclingWordIndex * 1.2}em)` }}
                        >
                            {cyclingWords.map((word, idx) => (
                                <span
                                    key={idx}
                                    className={`h-[1.2em] flex items-center justify-center font-bold transition-opacity duration-500 ${idx === currentCyclingWordIndex ? 'opacity-100' : 'opacity-20'
                                        }`}
                                >
                                    {word}
                                </span>
                            ))}
                        </span>
                    </span>
                </span>
            ));
        } else if (showInput && inputPlaceholder && workingText.includes(inputPlaceholder)) {
            renderedTextNode = wrapWord(workingText, inputPlaceholder, () => (
                <span className="relative inline-block">
                    {inputInstruction && !showInputAsStatic && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-sky-600 text-sm italic font-serif whitespace-nowrap animate-in fade-in duration-500 flex flex-col items-center">
                            <span>{inputInstruction}</span>
                            <span className="text-base leading-none">↓</span>
                        </span>
                    )}
                    {showInputAsStatic ? (
                        <span className="inline px-1 py-1 font-bold text-stone-800 bg-yellow-200 rounded mx-1">
                            {inputValue || '...'}
                        </span>
                    ) : (
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            className="inline px-1 py-1 border-b-2 border-yellow-400 outline-none font-bold text-stone-800 bg-yellow-200 rounded mx-1 w-[100px] text-center"
                            placeholder="..."
                        />
                    )}
                </span>
            ));
        } else if (flashingWord && workingText.includes(flashingWord)) {
            renderedTextNode = wrapWord(workingText, flashingWord, (word) => (
                <span className={`transition-opacity duration-300 ${isFlashingVisible ? 'opacity-100' : 'opacity-0'} bg-yellow-200 px-1 rounded mx-1 font-bold`}>
                    {word}
                </span>
            ));
        } else if (obscuredWord && workingText.includes(obscuredWord)) {
            renderedTextNode = wrapWord(workingText, obscuredWord, (word) => (
                <span className="inline-block bg-black text-transparent px-2 py-1 rounded mx-1 select-none animate-in fade-in duration-700">
                    {word}
                </span>
            ));
        } else if (highlightedWord && workingText.includes(highlightedWord)) {
            if (highlightFirstOnly) {
                // Only highlight the first occurrence
                renderedTextNode = wrapWord(workingText, highlightedWord, (word) => (
                    <span className="bg-yellow-200 px-1 rounded mx-1 font-bold">
                        {word}
                    </span>
                ));
            } else {
                // Highlight all occurrences of the word
                const parts = workingText.split(highlightedWord);
                renderedTextNode = (
                    <>
                        {parts.map((part, idx) => (
                            <React.Fragment key={idx}>
                                {part}
                                {idx < parts.length - 1 && (
                                    <span className="bg-yellow-200 px-1 rounded mx-1 font-bold">
                                        {highlightedWord}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </>
                );
            }
        }

        // If we have a second line that should be faded, render it separately
        if (secondLine !== null) {
            return (
                <div className="text-xl md:text-2xl leading-snug text-stone-800">
                    <p>{renderedTextNode}</p>
                    <p className="transition-opacity duration-1000 opacity-0">{secondLine}</p>
                </div>
            );
        }

        return <p className="text-xl md:text-2xl leading-snug text-stone-800 whitespace-pre-line">{renderedTextNode}</p>;
    };

    return (
        <div className={`w-full h-full flex flex-col items-center bg-stone-50 rounded-3xl shadow-inner p-8 transition-all duration-500 font-serif relative overflow-hidden ${layout === 'stacked' ? 'justify-start pt-16' : 'justify-center'}`}>

            <div className={`max-w-4xl text-center transition-all duration-500 ${layout === 'stacked' ? 'mb-8' : ''}`}>
                {renderText()}
            </div>

            {/* Multiple Choice Area */}
            {choices && localChoicesState !== 'initial' && (
                <div className={`flex flex-col gap-3 items-stretch w-full max-w-2xl z-20 transition-all duration-1000 mt-8
                    ${localChoicesState === 'revealed' ? 'opacity-100' : ''}
                    ${localChoicesState === 'fading-out' ? 'opacity-0' : ''}
                `}>
                    {choices.map(choice => {
                        const isSelected = selectedChoice === choice.id;
                        const showFeedback = localChoicesState === 'feedback' || (localChoicesState === 'revealed' && isSelected);
                        const isWarning = warningChoice === choice.id;

                        let buttonClass = "bg-white border-stone-200 hover:border-sky-500 hover:text-sky-600 text-stone-700 shadow-sm text-left";
                        if (isSelected) {
                            if (choice.isCorrect) {
                                buttonClass = "bg-green-500 text-white border-green-500 text-left";
                            } else {
                                buttonClass = "bg-red-100 text-red-800 border-red-300 text-left";
                            }
                        }

                        return (
                            <div key={choice.id} className="flex flex-col relative">
                                <button
                                    onClick={() => {
                                        setSelectedChoice(choice.id);
                                        if (choice.isCorrect) {
                                            confetti({
                                                particleCount: 100,
                                                spread: 70,
                                                origin: { y: 0.6 }
                                            });
                                        }
                                    }}
                                    className={`px-6 py-4 rounded-xl font-bold text-lg transition-all border-2 w-full ${buttonClass} ${isWarning ? 'animate-pulse' : ''}`}
                                >
                                    {choice.text}
                                </button>
                                {isWarning && (
                                    <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-sm font-bold px-3 py-2 rounded-full animate-bounce">
                                        Too obvious!
                                    </div>
                                )}
                                {showFeedback && choice.feedback && (
                                    <div className={`mt-2 px-6 text-sm font-sans font-bold animate-in fade-in slide-in-from-top-2 ${choice.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                                        {choice.feedback}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default SATVisual;

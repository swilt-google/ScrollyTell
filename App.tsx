import React, { useState, useCallback } from 'react';
import Step from './components/Step';
import VisualStage from './components/VisualStage';
import Quiz from './components/Quiz';
import { LessonDefinition, CartesianVisualState, WaveformVisualState, AlgebraSequenceFrame, AlgebraVisualState, SATVisualState } from './types';

// --- Reusable Inline Slider ---
const InlineSlider = ({ value, onChange, min, max, step = 0.1, label }: any) => (
  <span className="inline-flex flex-col align-middle mx-2 p-2 bg-stone-200 rounded-lg border border-stone-300 relative -top-1 z-30">
    <label className="text-[10px] uppercase font-bold text-stone-500 sans mb-1">{label}</label>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-24 md:w-32 accent-current cursor-pointer"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    />
  </span>
);

// =========================================
// LESSON CONTENT DEFINITIONS
// =========================================

const useWaveformLesson = (): LessonDefinition => {
  const [amp, setAmp] = useState(1);
  const [freq, setFreq] = useState(1);
  const base: Omit<WaveformVisualState, 'amplitude' | 'frequency'> = { type: 'waveform' };

  return {
    id: 'waveforms',
    title: 'Waveforms',
    description: 'Learn the basics of sound physics.',
    quiz: {
      question: "If a sound is louder, how does its waveform change?",
      options: [
        { id: 0, text: "Frequency increases", correct: false, explanation: "Frequency controls pitch." },
        { id: 1, text: "Amplitude increases", correct: true, explanation: "Amplitude is perceived as loudness." },
        { id: 2, text: "Wavelength gets longer", correct: false, explanation: "Related to pitch, not loudness." },
      ]
    },
    steps: [
      { id: 'intro', visualState: { ...base, amplitude: 0.5, frequency: 1, isPlaying: true }, content: (<><h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Let's Learn About <span className="text-sky-600">Waveforms</span>.</h1><p>An interactive guide to the funny shapes of sound.</p><p className="mt-4 text-stone-500 text-sm sans font-bold uppercase tracking-widest">Scroll to begin ↓</p></>) },
      { id: 'basics', visualState: { ...base, amplitude: 0.5, frequency: 1, showTimeAxis: true }, content: (<><h2 className="text-3xl font-bold mb-4">1. Time & Displacement</h2><p>The horizontal axis is <strong>Time</strong>. The vertical axis is <strong>Displacement</strong>.</p></>) },
      { id: 'amp-interactive', visualState: { ...base, amplitude: amp, frequency: 1, showDisplacementAxis: true, showTimeAxis: true }, content: (<><h2 className="text-3xl font-bold mb-4">2. Amplitude</h2><p><strong>Amplitude</strong> is loudness.</p><div className="text-sky-600"><InlineSlider min={0} max={1} value={amp} onChange={setAmp} label="Amplitude" /></div><p>Try moving the slider.</p></>) },
      { id: 'freq-interactive', visualState: { ...base, amplitude: 0.5, frequency: freq, isPlaying: true, showTimeAxis: true }, content: (<><h2 className="text-3xl font-bold mb-4">3. Frequency</h2><p><strong>Frequency</strong> is pitch.</p><div className="text-amber-600"><InlineSlider min={0.5} max={5} value={freq} onChange={setFreq} label="Frequency" /></div></>) },
    ]
  };
};



// --- SYSTEMS LESSON ---
const useSystemsLesson = (): LessonDefinition => {
  const f1 = (x: number) => 2 * x + 1;
  const f2 = (x: number) => -1 * x + 4;

  const cartesianBase: CartesianVisualState = {
    type: 'cartesian',
    plots: [
      { fn: f1, color: '#0ea5e9', label: 'y = 2x + 1', labelX: 2 },
      { fn: f2, color: '#ef4444', label: 'y = -x + 4', labelX: 4.5 }
    ],
    domain: [-2, 6],
    range: [-2, 6]
  };

  // Interactive Substitution Step
  const interactiveSubstitution: AlgebraVisualState = {
    type: 'algebra',
    annotation: "Drag one equation into the other!",
    richEquations: [
      // Line 1: y (target) = 2x + 1 (draggable blue)
      [
        { type: 'drop-target', id: 'target-1', value: 'y', accepts: ['expr-2'] },
        { type: 'text', value: ' = ' },
        { type: 'draggable', id: 'expr-1', value: '2x + 1', color: 'bg-sky-500' }
      ],
      // Line 2: y (target) = -x + 4 (draggable red)
      [
        { type: 'drop-target', id: 'target-2', value: 'y', accepts: ['expr-1'] },
        { type: 'text', value: ' = ' },
        { type: 'draggable', id: 'expr-2', value: '-x + 4', color: 'bg-red-500' }
      ]
    ],
    interaction: {
      type: 'drag-drop',
      successAnnotation: "Combined!",
      solvedEquations: [
        [
          { type: 'highlight', value: '2x + 1', color: '#bae6fd' },
          { type: 'text', value: ' = ' },
          { type: 'highlight', value: '-x + 4', color: '#fecaca' }
        ]
      ],
      nextInteraction: {
        type: 'command-input',
        title: 'Solve for x',
        commandPrompt: 'What should you do on each side of the equation to group the x terms?',
        correctCommand: '+x',
        solvedEquations: [
          [{ type: 'text', value: '3x + 1 = 4' }]
        ],
        successAnnotation: "Added x to both sides!",
        nextInteraction: {
          type: 'command-input',
          title: 'Solve for x',
          commandPrompt: 'Now, how do we isolate 3x?',
          correctCommand: '-1',
          solvedEquations: [
            [{ type: 'text', value: '3x = 3' }]
          ],
          successAnnotation: "Subtracted 1 from both sides!",
          nextInteraction: {
            type: 'command-input',
            title: 'Solve for x',
            commandPrompt: 'Finally, how do we find x?',
            correctCommand: '/3',
            solvedEquations: [
              [{ type: 'highlight', value: 'x = 1', color: '#bbf7d0', animation: 'pulse' }]
            ],
            successAnnotation: "Solved for x!"
          }
        }
      }
    }
  };



  // Step 4: Find Y (Merged Sequence)
  const seqFindY: AlgebraSequenceFrame[] = [
    {
      duration: 2000,
      richEquations: [
        [{ type: 'highlight', value: 'x = 1', color: '#bae6fd' }],
        [{ type: 'text', value: 'y = 2' }, { type: 'highlight', value: 'x', color: '#bae6fd' }, { type: 'text', value: ' + 1' }]
      ]
    },
    {
      duration: 2000,
      annotation: "Plug x = 1 into the first equation",
      richEquations: [
        [{ type: 'text', value: 'x = 1' }],
        [{ type: 'text', value: 'y = 2(' }, { type: 'highlight', value: '1', color: '#bae6fd', animation: 'slide-in-top' }, { type: 'text', value: ') + 1' }]
      ]
    },
    {

      richEquations: [
        [{ type: 'text', value: 'x = 1' }],
        [{ type: 'text', value: 'y = 2(1) + 1' }],
        [{ type: 'highlight', value: 'y = 3', color: '#bbf7d0', animation: 'pulse' }]
      ]
    }
  ];

  return {
    id: 'systems',
    title: 'Solving Systems of Linear Equations',
    description: 'Find where two lines meet, visually and algebraically.',
    quiz: {
      question: "Your turn! Solve the system: y = x + 5 and y = 3x - 1",
      options: [
        { id: 0, text: "(3, 8)", correct: true, explanation: "Correct! x=3, y=8 works for both." },
        { id: 1, text: "(1, 6)", correct: false, explanation: "Checks out for the first equation, but not the second." },
        { id: 2, text: "(2, 7)", correct: false, explanation: "Close, but not quite." },
        { id: 3, text: "(0, 5)", correct: false, explanation: "That's just the y-intercept of the first line." }
      ]
    },
    steps: [
      {
        id: 'intro',
        visualState: { ...cartesianBase, introAnimation: true },
        content: (<><h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Let's Learn About <span className="text-sky-600">Systems of Equations</span>.</h1><p>Find out what happens when two lines meet.</p><p className="mt-4 text-stone-500 text-sm sans font-bold uppercase tracking-widest">Scroll to begin ↓</p></>)
      },
      {
        id: 'step1',
        visualState: {
          ...cartesianBase,
          introAnimation: true,
          showHoverCoordinates: true,
          interaction: { type: 'pick-point', target: { x: 1, y: 3, tolerance: 0.6 }, successMessage: "Nice!" }
        },
        content: (<><h2 className="text-3xl font-bold mb-4">System of Equations</h2><p>Solving a <strong>system of equations</strong> just means finding the one single point (x, y) where two lines meet.</p><p className="font-bold mt-4 text-sky-600">Look at the graph. Click on the exact point where you see the blue and red lines cross.</p></>)
      },
      {
        id: 'step2',
        visualState: interactiveSubstitution,
        content: (<><h2 className="text-3xl font-bold mb-4">The 'Substitution' Move</h2><p>You found the answer visually. Now, let's solve it using algebra with a method called "substitution." Since both equations are equal to 'y', we can start by setting them equal to each other and solving for x.</p><p className="font-bold mt-4 text-sky-600">Drag the colorful part of one equation onto the 'y' of the other equation to combine them. <p>After combining, follow the prompts to solve for x.</p></p></>)
      },
      {
        id: 'step3',
        visualState: { type: 'algebra', sequence: seqFindY },
        content: (<><h2 className="text-3xl font-bold mb-4">Find y</h2><p> We can use <strong>x = 1</strong> to find 'y', by plugging '1' into either of our original equations for x.<p>Let's use the first one: y = 2x + 1.</p></p></>)
      },
      {
        id: 'step4',
        visualState: {
          type: 'sequence',
          sequence: [
            {
              duration: 3000,
              state: {
                type: 'algebra',
                richEquations: [
                  [{ type: 'text', value: 'x = 1, y = 3' }],
                  [{ type: 'highlight', value: '(1, 3)', color: '#bbf7d0', animation: 'fly-in' }]
                ]
              }
            },
            {
              duration: 0,
              state: { ...cartesianBase, introAnimation: true, highlightPoints: [{ x: 1, y: 3, label: '(1, 3)', color: '#10b981', animation: 'pulse' }] }
            }
          ]
        },
        content: (<><h2 className="text-3xl font-bold mb-4">The Final Answer</h2><p>Now we know: <strong>x = 1</strong> and <strong>y = 3</strong>.</p><p>Wasn't that the exact point you clicked on the graph in Step 1? You solved it two different ways!</p></>)
      }
    ]
  };
};


// --- SAT STRATEGY LESSON ---
const useSATLesson = (): LessonDefinition => {
  const base: SATVisualState = { type: 'sat' };

  const formChoices = [
    { id: 'a', text: 'A) shape', isCorrect: false },
    { id: 'b', text: 'B) type', isCorrect: false },
    { id: 'c', text: 'C) develop', isCorrect: true },
    { id: 'd', text: 'D) etiquette', isCorrect: false }
  ];

  return {
    id: 'sat-strategy',
    title: 'SAT Strategy: Words in Context',
    description: 'Master the "Words in Context" questions with a step-by-step guide.',
    quiz: {
      question: "What is the most important first step for 'Words in Context' questions?",
      options: [
        { id: 0, text: "Read all the answer choices immediately.", correct: false, explanation: "This is a trap! You might get biased by the common definitions." },
        { id: 1, text: "Predict your own word for the blank.", correct: true, explanation: "Yes! This helps you avoid traps and find the best fit for the specific context." },
        { id: 2, text: "Choose the most sophisticated-sounding word.", correct: false, explanation: "SAT doesn't just test big words; it tests precise meaning in context." }
      ]
    },
    steps: [
      {
        id: 'intro',
        visualState: {
          ...base,
          text: "The nature of the debate.",
          cyclingTarget: 'nature',
          cyclingWords: ['character', 'quality', 'essence', 'core', 'spirit', 'substance', 'gist', 'nature']
        },
        content: (<><h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">SAT Strategy: <span className="text-sky-600">Words in Context</span></h1><p>Here is a step-by-step guide to tackling "Words in Context" questions on the SAT, complete with visual cues and interactive elements.</p></>)
      },
      {
        id: 'sat-trap',
        visualState: {
          ...base,
          text: "The students hoped to form a new robotics club.\nAs used in the sentence, form most nearly means...",
          highlightedWord: 'form',
          highlightFirstOnly: true,
          choices: formChoices,
          choicesState: 'revealed',
          warningChoice: 'a'
        },
        content: (<><h2 className="text-3xl font-bold mb-4">The SAT Trap</h2><p>In 'Words in Context' questions, the SAT loves to trap you. The question will ask for the meaning of a common word, and one of the answer choices will be that word's most common definition. This is almost always wrong.</p></>)
      },
      {
        id: 'cover-up-strategy',
        visualState: {
          type: 'sequence',
          sequence: [
            {
              duration: 1500,
              state: {
                ...base,
                text: "The students hoped to form a new robotics club.\nAs used in the sentence, form most nearly means...",
                highlightedWord: 'form',
                highlightFirstOnly: true,
                choices: formChoices,
                choicesState: 'revealed'
              }
            },
            {
              duration: 1500,
              state: {
                ...base,
                text: "The students hoped to form a new robotics club.\nAs used in the sentence, form most nearly means...",
                flashingWord: 'form',
                choices: formChoices,
                choicesState: 'fading-out',
                fadeSecondLine: true
              }
            },
            {
              duration: 0,
              state: {
                ...base,
                text: "The students hoped to form a new robotics club.\nAs used in the sentence, form most nearly means...",
                inputPlaceholder: 'form',
                showInput: true,
                inputInstruction: "Type your own word here",
                fadeSecondLine: true
              }
            }
          ]
        },
        content: (<><h2 className="text-3xl font-bold mb-4">The 'Cover Up' Strategy</h2><p>Here's the strategy: Go back to the sentence in the passage and mentally cover up the word and treat it like a fill-in-the-blank. Before you even look at the choices, predict your own word that makes sense in the blank.</p></>)
      },
      {
        id: 'match-prediction',
        visualState: {
          ...base,
          text: "The students hoped to form a new robotics club.\nAs used in the sentence, form most nearly means...",
          inputPlaceholder: 'form',
          showInput: true,
          showInputAsStatic: true,
          layout: 'stacked',
          choices: [
            { id: 'a', text: 'A) shape', isCorrect: false, feedback: "Common definition, but doesn't fit context." },
            { id: 'b', text: 'B) type', isCorrect: false },
            { id: 'c', text: 'C) develop', isCorrect: true, feedback: "YES! Matches prediction." },
            { id: 'd', text: 'D) etiquette', isCorrect: false }
          ],
          choicesState: 'revealed'
        },
        content: (<><h2 className="text-3xl font-bold mb-4">Match Your Prediction</h2><p>Now, look at the answer choices and find the one that best matches your prediction. The common definition, 'shape,' makes no sense here.</p></>)
      },
      {
        id: 'your-turn',
        visualState: {
          type: 'sequence',
          sequence: [
            {
              duration: 1500,
              state: {
                ...base,
                text: "The scientist was able to observe the reaction through the microscope.\n\nAs used in the sentence, observe most nearly means...",
                highlightedWord: 'observe',
                highlightFirstOnly: true,
                layout: 'stacked'
              }
            },
            {
              duration: 2000,
              state: {
                ...base,
                text: "The scientist was able to observe the reaction through the microscope.\n\nAs used in the sentence, observe most nearly means...",
                flashingWord: 'observe',
                layout: 'stacked'
              }
            },
            {
              duration: 0,
              state: {
                ...base,
                text: "The scientist was able to observe the reaction through the microscope.\n\nAs used in the sentence, observe most nearly means...",
                inputPlaceholder: 'observe',
                showInput: true,
                layout: 'stacked',
                revealChoicesOnInput: true,
                choices: [
                  { id: 'a', text: 'A) follow', isCorrect: false },
                  { id: 'b', text: 'B) watch', isCorrect: true, feedback: "YES! Perfect match." },
                  { id: 'c', text: 'C) comment', isCorrect: false },
                  { id: 'd', text: 'D) obey', isCorrect: false }
                ]
              }
            }
          ]
        },
        content: (<><h2 className="text-3xl font-bold mb-4">Now Try It Yourself</h2><p>Use the same strategy! Cover up the word, predict what makes sense, then find the match.</p></>)
      }
    ]
  };
};



// =========================================
// MAIN APP COMPONENT
// =========================================

function App() {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Initialize all lessons
  const waveforms = useWaveformLesson();
  const systems = useSystemsLesson();
  const satLesson = useSATLesson();
  const lessons = [systems, satLesson]; // Hiding waveforms for now

  const activeLesson = lessons.find(l => l.id === selectedLessonId);

  if (!activeLesson) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-stone-800">ScrollyTell</h1>
          <p className="text-xl text-stone-600 mb-12">Learn through interactive scrolling lessons.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {lessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => setSelectedLessonId(lesson.id)}
                className="group text-left p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-sky-500 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-sky-600 transition-colors">{lesson.title}</h3>
                  <p className="text-stone-500 leading-relaxed">{lesson.description}</p>
                </div>
                <div className="mt-8 text-sm font-bold text-sky-600 opacity-50 group-hover:opacity-100 transition-opacity">OPEN MODULE →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <LessonEngine lesson={activeLesson} onExit={() => setSelectedLessonId(null)} />;
}

const LessonEngine = ({ lesson, onExit }: { lesson: LessonDefinition, onExit: () => void }) => {
  const [activeStepId, setActiveStepId] = useState<string>(lesson.steps[0].id);
  const handleStepEnter = useCallback((id: string) => setActiveStepId(id), []);
  const currentStep = lesson.steps.find(step => step.id === activeStepId) || lesson.steps[0];

  return (
    <main className="flex flex-col md:flex-row w-full min-h-screen bg-stone-50">
      <button onClick={onExit} className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/80 backdrop-blur rounded-full text-sm font-bold shadow-sm hover:bg-stone-100 transition-colors text-stone-600">
        ← Menu
      </button>

      <div className="sticky top-0 h-[50vh] md:h-screen w-full md:w-1/2 lg:w-3/5 bg-stone-100 z-10 shadow-2xl md:shadow-none md:border-r border-stone-200 overflow-hidden">
        <div className="h-full w-full p-4 md:p-8 lg:p-12 flex items-center justify-center">
          {activeStepId === 'quiz' ? (
            <div className="w-full max-w-xl">
              <Quiz data={lesson.quiz} />
            </div>
          ) : (
              <div className="w-full max-w-2xl aspect-square relative">
                <div className="absolute inset-0">
                <VisualStage state={currentStep.visualState} />
                </div>
              </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2/5 relative z-20">
        <div className="pb-[50vh]">
          {lesson.steps.map((step, index) => (
            <Step key={step.id} id={step.id} onInView={handleStepEnter} isLast={index === lesson.steps.length - 1}>
              {step.content}
            </Step>
          ))}
        </div>
      </div>
    </main>
  );
};

export default App;

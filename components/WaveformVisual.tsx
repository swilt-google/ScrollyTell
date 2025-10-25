
import React, { useEffect, useRef, useState } from 'react';
import { WaveformVisualState } from '../types';

interface Props {
  state: WaveformVisualState;
}

const WaveformVisual: React.FC<Props> = ({ state }) => {
  const {
    amplitude,
    frequency,
    showTimeAxis = false,
    showDisplacementAxis = false,
    highlightPoint = false,
    isPlaying = false
  } = state;

  const [offset, setOffset] = useState(0);
  const animationRef = useRef<number>(0); // Initialized with 0

  // Animation loop for "playing" sound
  useEffect(() => {
    if (!isPlaying) {
      setOffset(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      // Speed of animation depends on frequency to look realistic
      setOffset(prev => (prev + delta * frequency * 2) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, frequency]);

  // SVG dimensions
  const width = 600;
  const height = 400;
  const padding = 60;
  const centerY = height / 2;
  const usableWidth = width - padding * 2;
  const maxAmplitudePixels = (height / 2) - padding;

  // Generate path data
  const points = 200;
  let pathData = `M ${padding} ${centerY}`;

  for (let i = 0; i <= points; i++) {
    const xRatio = i / points;
    const x = padding + xRatio * usableWidth;
    // Basic sine wave formula: y = A * sin(B * x + C)
    const y = centerY - Math.sin(xRatio * Math.PI * 2 * frequency + offset) * (amplitude * maxAmplitudePixels);
    pathData += ` L ${x} ${y}`;
  }

  // Calculate highlighted point position (e.g., at 75% across)
  const highlightRatio = 0.75;
  const highlightX = padding + highlightRatio * usableWidth;
  const highlightY = centerY - Math.sin(highlightRatio * Math.PI * 2 * frequency + offset) * (amplitude * maxAmplitudePixels);

  return (
    <div className="w-full h-full flex items-center justify-center bg-stone-100 rounded-3xl shadow-inner p-4 transition-all duration-500">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[80vh] overflow-visible">
        {/* Grid/Axes Background */}
        <line x1={padding} y1={centerY} x2={width - padding} y2={centerY} stroke="#1c1917" strokeWidth="2" opacity="0.8" />

        {/* Time Axis (X) */}
        <g className={`transition-opacity duration-700 ${showTimeAxis ? 'opacity-100' : 'opacity-0'}`}>
           <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4" />
           <text x={padding} y={height - padding + 20} textAnchor="middle" className="text-xs fill-stone-500 sans font-bold">0s</text>

           <line x1={width/2} y1={padding} x2={width/2} y2={height-padding} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4" />
           <text x={width/2} y={height - padding + 20} textAnchor="middle" className="text-xs fill-stone-500 sans font-bold">0.5s</text>

           <line x1={width-padding} y1={padding} x2={width-padding} y2={height-padding} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4" />
           <text x={width - padding} y={height - padding + 20} textAnchor="middle" className="text-xs fill-stone-500 sans font-bold">1.0s</text>
           <text x={width - padding + 40} y={centerY + 4} className="text-sm fill-stone-400 sans font-bold">TIME</text>
        </g>

        {/* Displacement Axis (Y) */}
        <g className={`transition-opacity duration-700 ${showDisplacementAxis ? 'opacity-100' : 'opacity-0'}`}>
           <line x1={padding - 10} y1={centerY - maxAmplitudePixels} x2={width - padding} y2={centerY - maxAmplitudePixels} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
           <text x={padding - 20} y={centerY - maxAmplitudePixels + 5} textAnchor="end" className="text-xs fill-stone-500 sans font-bold">+1</text>

           <line x1={padding - 10} y1={centerY + maxAmplitudePixels} x2={width - padding} y2={centerY + maxAmplitudePixels} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
           <text x={padding - 20} y={centerY + maxAmplitudePixels + 5} textAnchor="end" className="text-xs fill-stone-500 sans font-bold">-1</text>
        </g>

        {/* The Wave */}
        <path
          d={pathData}
          fill="none"
          stroke="#0ea5e9" /* sky-500 */
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Highlighted Particle */}
        <g className={`transition-opacity duration-500 ${highlightPoint ? 'opacity-100' : 'opacity-0'}`}>
          <circle cx={highlightX} cy={highlightY} r="8" fill="#ef4444" />
          {showDisplacementAxis && (
             <line x1={highlightX} y1={centerY} x2={highlightX} y2={highlightY} stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" opacity="0.6" />
          )}
        </g>

      </svg>
    </div>
  );
};

export default WaveformVisual;

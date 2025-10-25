
import React, { useState, useRef, useEffect } from 'react';
import { CartesianVisualState } from '../types';

interface Props {
  state: CartesianVisualState;
}

const CartesianVisual: React.FC<Props> = ({ state }) => {
  const {
    plots,
    highlightPoints = [],
    showSlopeAt,
    domain = [-10, 10],
    range = [-10, 10],
    introAnimation = false,
    showHoverCoordinates = false,
    interaction
  } = state;

  const [successPoint, setSuccessPoint] = useState<{x: number, y: number} | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{x: number, y: number, color: string} | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Clear local state when overall state changes significantly
  useEffect(() => {
      setSuccessPoint(null);
      setFeedback(null);
      setHoverPoint(null);
  }, [state.plots, interaction?.target.x]);

  const width = 600;
  const height = 600;
  const padding = 40;

  // Coordinate mapping functions
  const mapX = (x: number) => padding + ((x - domain[0]) / (domain[1] - domain[0])) * (width - padding * 2);
  const mapY = (y: number) => height - (padding + ((y - range[0]) / (range[1] - range[0])) * (height - padding * 2));
  
  // Inverse mapping for interactions
  const inverseMapX = (svgX: number) => domain[0] + ((svgX - padding) / (width - padding * 2)) * (domain[1] - domain[0]);
  const inverseMapY = (svgY: number) => range[0] + ((height - svgY - padding) / (height - padding * 2)) * (range[1] - range[0]);

  const originX = mapX(0);
  const originY = mapY(0);

  const getMouseMathCoords = (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const clickSvgX = (e.clientX - rect.left) * scaleX;
      const clickSvgY = (e.clientY - rect.top) * scaleY;
      return {
          x: inverseMapX(clickSvgX),
          y: inverseMapY(clickSvgY),
          svgX: clickSvgX,
          svgY: clickSvgY
      };
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!showHoverCoordinates || successPoint) {
          setHoverPoint(null);
          return;
      }
      
      const coords = getMouseMathCoords(e);
      if (!coords) return;

      let bestMatch: {x: number, y: number, color: string} | null = null;
      // Increased tolerance for easier snapping to integers
      const tolerance = 0.4; 

      // 1. Snap mouse X to nearest integer
      const snappedX = Math.round(coords.x);

      // 2. Check if mouse is close enough to this integer X line
      if (Math.abs(coords.x - snappedX) <= tolerance) {
          for (const plot of plots) {
              // 3. Find the exact Y on the line for this integer X
              const exactY = plot.fn(snappedX);
              
              // 4. Check if the mouse Y is close to this point
              if (Math.abs(coords.y - exactY) <= tolerance) {
                  // 5. CRITICAL: Only show if the resulting Y is ALSO an integer (or extremely close due to float precision)
                  if (Math.abs(exactY - Math.round(exactY)) < 0.001) {
                      bestMatch = { x: snappedX, y: Math.round(exactY), color: plot.color };
                      break; 
                  }
              }
          }
      }
      setHoverPoint(bestMatch);
  };

  const handleMouseLeave = () => {
      setHoverPoint(null);
  }

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interaction || interaction.type !== 'pick-point' || successPoint) return;

      const coords = getMouseMathCoords(e);
      if (!coords) return;

      const target = interaction.target;
      const tolerance = target.tolerance || 0.5; 

      const dist = Math.sqrt(Math.pow(coords.x - target.x, 2) + Math.pow(coords.y - target.y, 2));

      if (dist <= tolerance) {
          setSuccessPoint({ x: target.x, y: target.y });
          setFeedback(interaction.successMessage);
      } else {
          setFeedback("Not quite! Try again.");
          setTimeout(() => setFeedback(null), 2000);
      }
  };

  const generatePath = (fn: (x: number) => number) => {
      const points = 500;
      let pathData = "";
      let isDrawing = false;

      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const xMath = domain[0] + t * (domain[1] - domain[0]);
        const yMath = fn(xMath);

        if (yMath >= range[0] && yMath <= range[1]) {
           const xSvg = mapX(xMath);
           const ySvg = mapY(yMath);
           if (!isDrawing) {
               pathData += ` M ${xSvg.toFixed(1)} ${ySvg.toFixed(1)}`;
               isDrawing = true;
           } else {
               pathData += ` L ${xSvg.toFixed(1)} ${ySvg.toFixed(1)}`;
           }
        } else {
            isDrawing = false;
        }
      }
      return pathData;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 rounded-3xl shadow-inner p-4 transition-all duration-500 relative">
        {/* Feedback Toast */}
        {feedback && (
            <div className={`absolute top-4 px-6 py-3 rounded-full font-bold text-xl shadow-lg z-10 animate-in slide-in-from-top-4 fade-in duration-300 ${successPoint ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {feedback}
            </div>
        )}

        <style>
        {`
            @keyframes drawLine { to { stroke-dashoffset: 0; } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}
        </style>

      <svg 
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`} 
        onClick={handleSvgClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`w-full max-h-[80vh] overflow-visible font-sans ${interaction && !successPoint ? 'cursor-crosshair' : ''}`}
      >
        {/* Grid & Axes */}
        {Array.from({ length: (domain[1] - domain[0]) / 2 + 1 }).map((_, i) => {
            const xVal = domain[0] + i * 2;
            if (xVal === 0) return null; // Skip drawing over main axis
            return (
                <g key={`x${i}`}>
                    <line x1={mapX(xVal)} y1={padding} x2={mapX(xVal)} y2={height-padding} stroke="#e7e5e4" strokeWidth="1" />
                    <text x={mapX(xVal)} y={originY + 25} textAnchor="middle" className="text-sm font-bold fill-stone-400">{xVal}</text>
                </g>
            );
        })}
        {Array.from({ length: (range[1] - range[0]) / 2 + 1 }).map((_, i) => {
            const yVal = range[0] + i * 2;
             if (yVal === 0) return null;
            return (
                <g key={`y${i}`}>
                    <line x1={padding} y1={mapY(yVal)} x2={width-padding} y2={mapY(yVal)} stroke="#e7e5e4" strokeWidth="1" />
                    <text x={originX - 15} y={mapY(yVal) + 5} textAnchor="end" className="text-sm font-bold fill-stone-400">{yVal}</text>
                </g>
            );
        })}
        <line x1={padding} y1={originY} x2={width - padding} y2={originY} stroke="#44403c" strokeWidth="2" />
        <line x1={originX} y1={height - padding} x2={originX} y2={padding} stroke="#44403c" strokeWidth="2" />

        {/* Plots */}
        {plots.map((plot, index) => {
             const isAnimating = introAnimation;
             const lineStyle = isAnimating ? { strokeDasharray: 3000, strokeDashoffset: 3000, animation: `drawLine 1.5s ease forwards ${index * 1.0}s` } : {};
             const labelStyle = isAnimating ? { opacity: 0, animation: `fadeIn 0.5s ease forwards ${index * 1.0 + 1.0}s` } : {};
             const labelXVal = plot.labelX !== undefined ? plot.labelX : (domain[1] - 1);

             return (
                <g key={index}>
                     <path d={generatePath(plot.fn)} fill="none" stroke={plot.color} strokeWidth={plot.width || 4} strokeLinecap="round" style={lineStyle} />
                      {plot.label && (
                          <text x={mapX(labelXVal) + 10} y={mapY(plot.fn(labelXVal))} fill={plot.color} className="text-xl font-bold" style={labelStyle} dominantBaseline="middle">{plot.label}</text>
                      )}
                </g>
             )
        })}

        {/* Slope Triangle */}
        {showSlopeAt !== undefined && plots[showSlopeAt.plotIndex] && (
            <g>
                <line x1={mapX(showSlopeAt.x)} y1={mapY(plots[showSlopeAt.plotIndex].fn(showSlopeAt.x))} x2={mapX(showSlopeAt.x + 1.5)} y2={mapY(plots[showSlopeAt.plotIndex].fn(showSlopeAt.x))} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6,4" />
                <line x1={mapX(showSlopeAt.x + 1.5)} y1={mapY(plots[showSlopeAt.plotIndex].fn(showSlopeAt.x))} x2={mapX(showSlopeAt.x + 1.5)} y2={mapY(plots[showSlopeAt.plotIndex].fn(showSlopeAt.x + 1.5))} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6,4" />
            </g>
        )}

        {/* Standard Highlight Points (No Glow) */}
        {highlightPoints.map((pt, i) => (
            <g key={`hl-${i}`} className="transition-all duration-500">
               <circle cx={mapX(pt.x)} cy={mapY(pt.y!)} r="7" fill={pt.color || "#ef4444"} stroke="white" strokeWidth="2" />
               {pt.label && <text x={mapX(pt.x) + 15} y={mapY(pt.y!) - 15} className="text-xl font-bold fill-stone-800" style={{ textShadow: '0px 0px 4px white' }}>{pt.label}</text>}
            </g>
        ))}

        {/* Success Point (Glows!) */}
        {successPoint && (
             <g className="transition-all duration-500">
                <circle cx={mapX(successPoint.x)} cy={mapY(successPoint.y)} r="30" fill="#10b981" opacity="0.4" className="animate-ping" />
                <circle cx={mapX(successPoint.x)} cy={mapY(successPoint.y)} r="10" fill="#10b981" stroke="white" strokeWidth="3" />
            </g>
        )}

        {/* Hover Tooltip (Integers Only) */}
        {hoverPoint && !successPoint && (
            <g pointerEvents="none" className="transition-opacity duration-200">
                <circle cx={mapX(hoverPoint.x)} cy={mapY(hoverPoint.y)} r="8" fill="white" stroke={hoverPoint.color} strokeWidth="4" />
                <rect x={mapX(hoverPoint.x) + 15} y={mapY(hoverPoint.y) - 45} width="80" height="36" rx="18" fill="white" stroke={hoverPoint.color} strokeWidth="3" />
                <text x={mapX(hoverPoint.x) + 55} y={mapY(hoverPoint.y) - 27} textAnchor="middle" dominantBaseline="middle" className="font-bold text-lg fill-stone-700">
                    {hoverPoint.x}, {hoverPoint.y}
                </text>
            </g>
        )}

      </svg>
    </div>
  );
};

export default CartesianVisual;

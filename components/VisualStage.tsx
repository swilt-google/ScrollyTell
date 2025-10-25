
import React, { useState, useEffect } from 'react';
import { AnyVisualState, AnySingleVisualState } from '../types';
import WaveformVisual from './WaveformVisual';
import CartesianVisual from './CartesianVisual';
import AlgebraVisual from './AlgebraVisual';

interface Props {
  state: AnyVisualState;
}

const VisualStage: React.FC<Props> = ({ state }) => {
  // Initialize with state if it's not a sequence, or first frame if it is
  const getInitialState = (s: AnyVisualState): AnySingleVisualState | null => {
    if (s.type === 'sequence') {
      return s.sequence.length > 0 ? s.sequence[0].state : null;
    }
    return s;
  };

  const [currentState, setCurrentState] = useState<AnySingleVisualState | null>(() => getInitialState(state));
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    if (state.type === 'sequence') {
      setSequenceIndex(0);
      if (state.sequence.length > 0) {
        setCurrentState(state.sequence[0].state);
      }
    } else {
      setCurrentState(state);
    }
  }, [state]);

  useEffect(() => {
    if (state.type === 'sequence' && sequenceIndex < state.sequence.length) {
      const currentFrame = state.sequence[sequenceIndex];
      setCurrentState(currentFrame.state);

      // Only set timer if duration > 0 AND there is a next frame
      if (currentFrame.duration > 0 && sequenceIndex < state.sequence.length - 1) {
        const timer = setTimeout(() => {
          setSequenceIndex(prev => prev + 1);
        }, currentFrame.duration);
        return () => clearTimeout(timer);
      }
    }
  }, [state, sequenceIndex]);

  if (!currentState) return null;

  switch (currentState.type) {
    case 'waveform':
      return <WaveformVisual state={currentState} />;
    case 'cartesian':
      return <CartesianVisual state={currentState} />;
    case 'algebra':
      return <AlgebraVisual state={currentState} />;
    default:
      return null;
  }
};

export default VisualStage;

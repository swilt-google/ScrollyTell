
import React from 'react';
import { AnyVisualState } from '../types';
import WaveformVisual from './WaveformVisual';
import CartesianVisual from './CartesianVisual';
import AlgebraVisual from './AlgebraVisual';

interface Props {
  state: AnyVisualState;
}

const VisualStage: React.FC<Props> = ({ state }) => {
  switch (state.type) {
    case 'waveform':
      return <WaveformVisual state={state} />;
    case 'cartesian':
      return <CartesianVisual state={state} />;
    case 'algebra':
      return <AlgebraVisual state={state} />;
    default:
      return null;
  }
};

export default VisualStage;

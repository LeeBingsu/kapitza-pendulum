import { useRef, useEffect, useState } from 'react';
import { SimulationState } from '../types';

interface Props {
  state: SimulationState;
  width: number;
  height: number;
}

interface DataPoint {
  time: number;
  angles: number[];
}

const MAX_POINTS = 400;
const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'
];

export const TimeSeriesCanvas: React.FC<Props> = ({ state, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<DataPoint[]>([]);
  const lastTimeRef = useRef<number>(0);
  
  // Update history with throttling
  useEffect(() => {
    if (state.time - lastTimeRef.current > 0.02) {
      lastTimeRef.current = state.time;
      setHistory(prev => {
        const newPoint = {
          time: state.time,
          angles: state.pendula.map(p => p.phi)
        };
        const newHistory = [...prev, newPoint];
        if (newHistory.length > MAX_POINTS) {
          return newHistory.slice(-MAX_POINTS);
        }
        return newHistory;
      });
    }
  }, [state.time, state.pendula]);
  
  // Reset history when simulation resets
  useEffect(() => {
    if (state.time < lastTimeRef.current) {
      setHistory([]);
      lastTimeRef.current = 0;
    }
  }, [state.time]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    const padding = { top: 30, bottom: 25, left: 40, right: 10 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    
    // Draw background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const yTicks = [-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI];
    yTicks.forEach(tick => {
      const y = padding.top + plotHeight / 2 - (tick / Math.PI) * (plotHeight / 2);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    });
    
    // Vertical grid lines (time)
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (i / 4) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();
    
    // X axis (at φ = 0)
    const zeroY = padding.top + plotHeight / 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(width - padding.right, zeroY);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('π', padding.left - 5, padding.top + 4);
    ctx.fillText('0', padding.left - 5, zeroY + 4);
    ctx.fillText('-π', padding.left - 5, height - padding.bottom + 4);
    
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', width / 2, height - 5);
    
    // Draw time series for each pendulum
    if (history.length > 1) {
      const timeSpan = history[history.length - 1].time - history[0].time || 1;
      const numPendula = Math.min(history[0].angles.length, 10); // Limit displayed pendula
      
      for (let p = 0; p < numPendula; p++) {
        ctx.strokeStyle = COLORS[p % COLORS.length];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        for (let i = 0; i < history.length; i++) {
          const x = padding.left + ((history[i].time - history[0].time) / timeSpan) * plotWidth;
          const y = padding.top + plotHeight / 2 - (history[i].angles[p] / Math.PI) * (plotHeight / 2);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }
    
    // Draw reference line at φ = π (inverted position)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    const invertedY = padding.top;
    ctx.beginPath();
    ctx.moveTo(padding.left, invertedY);
    ctx.lineTo(width - padding.right, invertedY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Angle vs Time', 10, 15);
    
  }, [history, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg shadow-lg"
    />
  );
};

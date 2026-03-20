import { useRef, useEffect } from 'react';
import { SimulationState, SimulationParams } from '../types';

interface Props {
  state: SimulationState;
  params: SimulationParams;
  width: number;
  height: number;
}

// Color palette for pendula
const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
  '#14B8A6', '#E11D48', '#22C55E', '#FACC15', '#A855F7'
];

export const PendulumCanvas: React.FC<Props> = ({ state, params, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    const n = state.pendula.length;
    const pendulumLength = Math.min(height * 0.35, 120);
    const bobRadius = Math.max(6, Math.min(12, 100 / n));
    
    // Calculate pivot positions based on number of pendula
    const spacing = Math.min(80, (width - 100) / Math.max(n - 1, 1));
    const startX = (width - spacing * (n - 1)) / 2;
    
    // Pivot oscillation amplitude for visualization
    const pivotAmplitude = 15;
    const pivotOffset = state.pivotY * pivotAmplitude * 10;
    
    // Draw each pendulum
    state.pendula.forEach((pendulum, i) => {
      const pivotX = startX + i * spacing;
      const pivotY = height * 0.3 + pivotOffset;
      
      // Bob position (φ = 0 is down, φ = π is up)
      // For visualization, we show the pendulum hanging from the pivot
      const bobX = pivotX + pendulumLength * Math.sin(pendulum.phi);
      const bobY = pivotY - pendulumLength * Math.cos(pendulum.phi);
      
      const color = COLORS[i % COLORS.length];
      
      // Draw pivot support
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw rod
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();
      
      // Draw bob with glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw bob outline
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Draw coupling springs (for nearest neighbor)
    if (params.coupling > 0 && n > 1) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      for (let i = 0; i < n; i++) {
        const pivotX1 = startX + i * spacing;
        const pivotY1 = height * 0.3 + pivotOffset;
        const bobX1 = pivotX1 + pendulumLength * Math.sin(state.pendula[i].phi);
        const bobY1 = pivotY1 - pendulumLength * Math.cos(state.pendula[i].phi);
        
        if (params.couplingType === 'nearest') {
          // Draw to next neighbor (periodic boundary)
          const nextIdx = (i + 1) % n;
          const pivotX2 = startX + nextIdx * spacing;
          const pivotY2 = height * 0.3 + pivotOffset;
          const bobX2 = pivotX2 + pendulumLength * Math.sin(state.pendula[nextIdx].phi);
          const bobY2 = pivotY2 - pendulumLength * Math.cos(state.pendula[nextIdx].phi);
          
          // Only draw if neighbors are adjacent visually
          if (Math.abs(nextIdx - i) === 1) {
            ctx.beginPath();
            ctx.moveTo(bobX1, bobY1);
            ctx.lineTo(bobX2, bobY2);
            ctx.stroke();
          }
        }
      }
      
      ctx.setLineDash([]);
    }
    
    // Draw oscillating platform
    ctx.fillStyle = '#334155';
    const platformY = height * 0.3 + pivotOffset;
    ctx.fillRect(startX - 20, platformY - 3, spacing * (n - 1) + 40, 6);
    
    // Draw driving oscillation indicator
    const indicatorX = 40;
    const indicatorY = height * 0.3;
    const indicatorHeight = 60;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(indicatorX - 10, indicatorY - indicatorHeight/2 - 5, 20, indicatorHeight + 10);
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(indicatorX, indicatorY - indicatorHeight/2);
    ctx.lineTo(indicatorX, indicatorY + indicatorHeight/2);
    ctx.stroke();
    
    // Current position indicator
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(indicatorX, platformY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pivot', indicatorX, indicatorY + indicatorHeight/2 + 15);
    
  }, [state, params, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg shadow-xl"
    />
  );
};

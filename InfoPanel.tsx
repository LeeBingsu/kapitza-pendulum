import { useRef, useEffect, useState } from 'react';
import { SimulationState } from '../types';

interface Props {
  state: SimulationState;
  width: number;
  height: number;
  selectedPendulum: number;
}

interface TrailPoint {
  phi: number;
  omega: number;
}

const MAX_TRAIL_LENGTH = 500;

export const PhaseSpaceCanvas: React.FC<Props> = ({ state, width, height, selectedPendulum }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const prevPendulumRef = useRef<number>(selectedPendulum);
  
  // Reset trail when pendulum selection changes
  useEffect(() => {
    if (prevPendulumRef.current !== selectedPendulum) {
      setTrail([]);
      prevPendulumRef.current = selectedPendulum;
    }
  }, [selectedPendulum]);
  
  // Update trail
  useEffect(() => {
    if (state.pendula.length > selectedPendulum) {
      const p = state.pendula[selectedPendulum];
      setTrail(prev => {
        const newTrail = [...prev, { phi: p.phi, omega: p.omega }];
        if (newTrail.length > MAX_TRAIL_LENGTH) {
          return newTrail.slice(-MAX_TRAIL_LENGTH);
        }
        return newTrail;
      });
    }
  }, [state.time, selectedPendulum, state.pendula]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw axes
    const centerX = width / 2;
    const centerY = height / 2;
    const scaleX = width / (2 * Math.PI * 1.2);
    const scaleY = height / 16; // Assuming omega range of roughly ±8
    
    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (phi values)
    for (let phi = -Math.PI; phi <= Math.PI; phi += Math.PI / 4) {
      const x = centerX + phi * scaleX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines (omega values)
    for (let omega = -8; omega <= 8; omega += 2) {
      const y = centerY - omega * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    
    // Horizontal axis (phi)
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Vertical axis (omega)
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('φ (rad)', width - 30, centerY - 10);
    ctx.fillText('ω', centerX + 15, 15);
    
    // Tick marks
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    
    ctx.fillText('-π', centerX - Math.PI * scaleX, centerY + 15);
    ctx.fillText('π', centerX + Math.PI * scaleX, centerY + 15);
    ctx.fillText('0', centerX + 8, centerY + 12);
    
    // Draw trail
    if (trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(centerX + trail[0].phi * scaleX, centerY - trail[0].omega * scaleY);
      
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.8})`;
        ctx.lineWidth = 1 + alpha;
        
        const x = centerX + trail[i].phi * scaleX;
        const y = centerY - trail[i].omega * scaleY;
        
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // Draw current point
    if (state.pendula.length > selectedPendulum) {
      const p = state.pendula[selectedPendulum];
      const x = centerX + p.phi * scaleX;
      const y = centerY - p.omega * scaleY;
      
      ctx.shadowColor = '#3B82F6';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Phase Space - Pendulum ${selectedPendulum + 1}`, 10, 20);
    
  }, [state, trail, width, height, selectedPendulum]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg shadow-lg"
    />
  );
};

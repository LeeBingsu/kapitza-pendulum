import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationParams, SimulationState } from './types';
import { rk4Step, initializeState } from './physics';
import { PendulumCanvas } from './components/PendulumCanvas';
import { PhaseSpaceCanvas } from './components/PhaseSpaceCanvas';
import { TimeSeriesCanvas } from './components/TimeSeriesCanvas';
import { Controls } from './components/Controls';
import { InfoPanel } from './components/InfoPanel';
import { TheoryPanel } from './components/TheoryPanel';

const DEFAULT_PARAMS: SimulationParams = {
  g0: 1.0,          // g/l
  g1: 10,           // aω²/l - driving amplitude
  drivingFreq: 5,   // ω - driving frequency
  coupling: 0.1,    // Λ - coupling strength
  damping: 0.05,    // damping coefficient
  numPendula: 5,    // number of pendula
  couplingType: 'nearest'
};

const DT = 0.002; // Integration time step

export default function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [state, setState] = useState<SimulationState>(() => initializeState(DEFAULT_PARAMS));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedPendulum, setSelectedPendulum] = useState(0);
  
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Reset simulation when number of pendula changes
  useEffect(() => {
    setState(initializeState(params));
    if (selectedPendulum >= params.numPendula) {
      setSelectedPendulum(0);
    }
  }, [params.numPendula]);
  
  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const elapsed = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    // Limit max dt to prevent instability
    const maxElapsed = Math.min(elapsed, 0.05);
    const stepsPerFrame = Math.ceil((maxElapsed * speed) / DT);
    
    setState(prevState => {
      let newState = prevState;
      for (let i = 0; i < stepsPerFrame; i++) {
        newState = rk4Step(newState, params, DT);
      }
      return newState;
    });
    
    animationRef.current = requestAnimationFrame(animate);
  }, [params, speed]);
  
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);
  
  const handleReset = () => {
    setState(initializeState(params));
    lastTimeRef.current = 0;
  };
  
  const handleToggleRun = () => {
    setIsRunning(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Coupled Kapitza Pendulum</h1>
              <p className="text-sm text-slate-400">Dynamical stabilization simulation</p>
            </div>
          </div>
          <a 
            href="https://arxiv.org/abs/1803.01643"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Based on arXiv:1803.01643 →
          </a>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Pendulum Visualization */}
            <div className="bg-slate-800 rounded-xl p-4 shadow-xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Pendulum System
              </h2>
              <PendulumCanvas 
                state={state}
                params={params}
                width={700}
                height={350}
              />
            </div>
            
            {/* Secondary Visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phase Space */}
              <div className="bg-slate-800 rounded-xl p-4 shadow-xl">
                <PhaseSpaceCanvas 
                  state={state}
                  width={340}
                  height={250}
                  selectedPendulum={selectedPendulum}
                />
              </div>
              
              {/* Time Series */}
              <div className="bg-slate-800 rounded-xl p-4 shadow-xl">
                <TimeSeriesCanvas 
                  state={state}
                  width={340}
                  height={250}
                />
              </div>
            </div>
            
            {/* Theory Panel */}
            <TheoryPanel />
          </div>
          
          {/* Right Column - Controls & Info */}
          <div className="space-y-6">
            <Controls 
              params={params}
              setParams={setParams}
              isRunning={isRunning}
              onToggleRun={handleToggleRun}
              onReset={handleReset}
              speed={speed}
              setSpeed={setSpeed}
              selectedPendulum={selectedPendulum}
              setSelectedPendulum={setSelectedPendulum}
            />
            
            <InfoPanel 
              state={state}
              params={params}
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>
            Physics simulation based on "Dynamics of a system of coupled inverted pendula with vertical forcing" 
            by Bhadra et al. (2018)
          </p>
          <p className="mt-1">
            Equations integrated using 4th-order Runge-Kutta method
          </p>
        </div>
      </footer>
    </div>
  );
}

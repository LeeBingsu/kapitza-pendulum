
import { SimulationParams } from '../types';

interface Props {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  selectedPendulum: number;
  setSelectedPendulum: (index: number) => void;
}

export const Controls: React.FC<Props> = ({
  params,
  setParams,
  isRunning,
  onToggleRun,
  onReset,
  speed,
  setSpeed,
  selectedPendulum,
  setSelectedPendulum
}) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Simulation Controls</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleRun}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-all"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Physics Parameters */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Physics Parameters</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              g₀ (gravity): {params.g0.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={params.g0}
              onChange={e => updateParam('g0', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              g₁ (drive amplitude): {params.g1.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={params.g1}
              onChange={e => updateParam('g1', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              ω (drive freq): {params.drivingFreq.toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={params.drivingFreq}
              onChange={e => updateParam('drivingFreq', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Λ (coupling): {params.coupling.toFixed(3)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.coupling}
              onChange={e => updateParam('coupling', parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              γ (damping): {params.damping.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={params.damping}
              onChange={e => updateParam('damping', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              N (pendula): {params.numPendula}
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={params.numPendula}
              onChange={e => updateParam('numPendula', parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Coupling Type */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Coupling Type</h3>
        <div className="flex gap-3">
          <button
            onClick={() => updateParam('couplingType', 'nearest')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              params.couplingType === 'nearest'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Nearest Neighbor
          </button>
          <button
            onClick={() => updateParam('couplingType', 'all-to-all')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              params.couplingType === 'all-to-all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All-to-All
          </button>
        </div>
      </div>

      {/* Simulation Speed */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          Simulation Speed: {speed}x
        </h3>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={speed}
          onChange={e => setSpeed(parseFloat(e.target.value))}
          className="w-full accent-green-500"
        />
      </div>

      {/* Pendulum Selector for Phase Space */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          Phase Space View: Pendulum {selectedPendulum + 1}
        </h3>
        <input
          type="range"
          min="0"
          max={params.numPendula - 1}
          step="1"
          value={selectedPendulum}
          onChange={e => setSelectedPendulum(parseInt(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setParams({
              g0: 1.0,
              g1: 10,
              drivingFreq: 5,
              coupling: 0,
              damping: 0.05,
              numPendula: 1,
              couplingType: 'nearest'
            })}
            className="py-2 px-3 rounded-lg text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
          >
            Single Stable
          </button>
          <button
            onClick={() => setParams({
              g0: 1.0,
              g1: 10,
              drivingFreq: 5,
              coupling: 0.1,
              damping: 0.05,
              numPendula: 5,
              couplingType: 'nearest'
            })}
            className="py-2 px-3 rounded-lg text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
          >
            NN Coupled (5)
          </button>
          <button
            onClick={() => setParams({
              g0: 1.0,
              g1: 10,
              drivingFreq: 5,
              coupling: 0.3,
              damping: 0.05,
              numPendula: 5,
              couplingType: 'nearest'
            })}
            className="py-2 px-3 rounded-lg text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
          >
            Strong Coupling
          </button>
          <button
            onClick={() => setParams({
              g0: 1.0,
              g1: 10,
              drivingFreq: 5,
              coupling: 0.1,
              damping: 0.05,
              numPendula: 5,
              couplingType: 'all-to-all'
            })}
            className="py-2 px-3 rounded-lg text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
          >
            All-to-All (5)
          </button>
          <button
            onClick={() => setParams({
              g0: 1.0,
              g1: 3,
              drivingFreq: 5,
              coupling: 0.5,
              damping: 0.02,
              numPendula: 8,
              couplingType: 'nearest'
            })}
            className="py-2 px-3 rounded-lg text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
          >
            Unstable Chain
          </button>
          <button
            onClick={() => setParams({
              g0: 1.0,
              g1: 15,
              drivingFreq: 8,
              coupling: 0.05,
              damping: 0.02,
              numPendula: 10,
              couplingType: 'nearest'
            })}
            className="py-2 px-3 rounded-lg text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all"
          >
            Large System
          </button>
        </div>
      </div>
    </div>
  );
};

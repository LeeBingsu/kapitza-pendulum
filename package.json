
import { SimulationState, SimulationParams } from '../types';
import { calculateMetrics } from '../physics';

interface Props {
  state: SimulationState;
  params: SimulationParams;
}

export const InfoPanel: React.FC<Props> = ({ state, params }) => {
  const metrics = calculateMetrics(state);
  
  return (
    <div className="bg-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      <h2 className="text-lg font-semibold text-white">System Status</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400 uppercase">Time</div>
          <div className="text-xl font-mono text-blue-400">{state.time.toFixed(2)}s</div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400 uppercase">Status</div>
          <div className={`text-xl font-bold ${metrics.isStable ? 'text-emerald-400' : 'text-red-400'}`}>
            {metrics.isStable ? '✓ Stable' : '✗ Unstable'}
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400 uppercase">Oscillating</div>
          <div className="text-xl font-mono text-cyan-400">{metrics.oscillatingCount}</div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400 uppercase">Rotating</div>
          <div className="text-xl font-mono text-amber-400">{metrics.rotatingCount}</div>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-lg p-3">
        <div className="text-xs text-slate-400 uppercase mb-2">Angle Spread</div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(metrics.angleSpread / Math.PI * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">{(metrics.angleSpread * 180 / Math.PI).toFixed(1)}°</div>
      </div>

      {/* Individual pendulum states */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 uppercase">Pendulum Angles</div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {state.pendula.slice(0, 10).map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 w-6">#{i + 1}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ 
                    width: `${Math.abs(p.phi / Math.PI) * 50 + 50}%`,
                    marginLeft: p.phi < 0 ? `${50 - Math.abs(p.phi / Math.PI) * 50}%` : '50%',
                  }}
                />
              </div>
              <span className="text-slate-400 font-mono w-16">{(p.phi * 180 / Math.PI).toFixed(1)}°</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Theory info */}
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Kapitza Stability</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          For stability: (g₁/ω)² {'>'} 2g₀ ⟹ <span className="font-mono text-blue-400">
            {((params.g1 / params.drivingFreq) ** 2).toFixed(2)}
          </span> vs <span className="font-mono text-amber-400">{(2 * params.g0).toFixed(2)}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {(params.g1 / params.drivingFreq) ** 2 > 2 * params.g0 
            ? '✓ Kapitza criterion satisfied' 
            : '✗ Below stability threshold'}
        </p>
      </div>
    </div>
  );
};

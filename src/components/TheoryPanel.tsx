import { useState } from 'react';

export const TheoryPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-xl">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-semibold text-white"
      >
        <span>📚 Theory & Background</span>
        <span className="text-slate-400">{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm text-slate-300">
          <section>
            <h3 className="font-medium text-blue-400 mb-2">The Kapitza Pendulum</h3>
            <p className="text-slate-400 leading-relaxed">
              The Kapitza pendulum is a rigid pendulum with a vertically oscillating pivot point. 
              Despite intuition, rapid vertical oscillation of the pivot can stabilize the 
              inverted (upside-down) position of the pendulum.
            </p>
          </section>
          
          <section>
            <h3 className="font-medium text-purple-400 mb-2">Equation of Motion</h3>
            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <p className="text-cyan-300">d²φᵢ/dt² = -(g₀ + g₁cos(ωt))sin(φᵢ) + Λ∑(φⱼ - φᵢ) - γ(dφᵢ/dt)</p>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              <li><span className="text-blue-300">φᵢ</span> - angle of pendulum i from vertical</li>
              <li><span className="text-blue-300">g₀</span> - gravitational parameter (g/l)</li>
              <li><span className="text-blue-300">g₁</span> - driving amplitude (aω²/l)</li>
              <li><span className="text-blue-300">ω</span> - driving frequency</li>
              <li><span className="text-blue-300">Λ</span> - coupling strength</li>
              <li><span className="text-blue-300">γ</span> - damping coefficient</li>
            </ul>
          </section>
          
          <section>
            <h3 className="font-medium text-emerald-400 mb-2">Stability Criterion</h3>
            <p className="text-slate-400 leading-relaxed">
              For a single pendulum, the inverted position is stable when:
            </p>
            <div className="bg-slate-900 rounded-lg p-2 font-mono text-sm text-center my-2">
              <span className="text-amber-300">(g₁/ω)² {'>'} 2g₀</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              This means fast oscillation with sufficient amplitude can overcome gravity.
            </p>
          </section>
          
          <section>
            <h3 className="font-medium text-rose-400 mb-2">Coupling Effects</h3>
            <p className="text-slate-400 leading-relaxed">
              When pendula are coupled (Λ {'>'} 0), the dynamics become more complex:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400 list-disc list-inside">
              <li>Coupling generally <span className="text-rose-300">degrades stability</span></li>
              <li>Nearest-neighbor coupling has stronger destabilizing effect than all-to-all</li>
              <li>Larger systems tend to be more stable</li>
              <li>Beats and clustering phenomena can emerge</li>
            </ul>
          </section>
          
          <section className="border-t border-slate-700 pt-4">
            <h3 className="font-medium text-slate-300 mb-2">Reference</h3>
            <p className="text-xs text-slate-500">
              Based on: "Dynamics of a system of coupled inverted pendula with vertical forcing"
              <br />
              <a 
                href="https://arxiv.org/abs/1803.01643" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                arXiv:1803.01643
              </a>
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

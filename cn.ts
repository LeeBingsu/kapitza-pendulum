// Physics engine for the Coupled Kapitza Pendulum Simulation
// Based on arXiv:1803.01643 - "Dynamics of a system of coupled inverted pendula with vertical forcing"

import { PendulumState, SimulationParams, SimulationState } from './types';

/**
 * Compute the acceleration for a single pendulum
 * Equation of motion: d²φ/dt² = -(g₀ + g₁cos(ωt))sin(φ) + Λ∑(φⱼ - φᵢ) - γ(dφ/dt)
 */
function computeAcceleration(
  index: number,
  pendula: PendulumState[],
  params: SimulationParams,
  time: number
): number {
  const { g0, g1, drivingFreq, coupling, damping, couplingType } = params;
  const phi = pendula[index].phi;
  const omega = pendula[index].omega;
  
  // Effective gravity with oscillating pivot
  // The pivot oscillates as y(t) = a*cos(ωt)
  // This gives an effective gravity: g_eff = g₀ + g₁*cos(ωt)
  const effectiveGravity = g0 + g1 * Math.cos(drivingFreq * time);
  
  // Gravitational torque (inverted pendulum, so sign is opposite)
  // For inverted pendulum stabilization, we use -sin(φ) where φ=π is inverted
  let acceleration = -effectiveGravity * Math.sin(phi);
  
  // Coupling term
  if (coupling > 0 && pendula.length > 1) {
    let couplingSum = 0;
    
    if (couplingType === 'nearest') {
      // Nearest neighbor coupling (1D chain with periodic boundary)
      const n = pendula.length;
      const leftIdx = (index - 1 + n) % n;
      const rightIdx = (index + 1) % n;
      couplingSum = (pendula[leftIdx].phi - phi) + (pendula[rightIdx].phi - phi);
    } else {
      // All-to-all coupling
      for (let j = 0; j < pendula.length; j++) {
        if (j !== index) {
          couplingSum += pendula[j].phi - phi;
        }
      }
      // Normalize by N-1 for all-to-all coupling
      couplingSum /= (pendula.length - 1);
    }
    
    acceleration += coupling * couplingSum;
  }
  
  // Damping
  acceleration -= damping * omega;
  
  return acceleration;
}

/**
 * 4th order Runge-Kutta integration step
 */
export function rk4Step(
  state: SimulationState,
  params: SimulationParams,
  dt: number
): SimulationState {
  const n = state.pendula.length;
  const t = state.time;
  
  // k1
  const k1Phi: number[] = [];
  const k1Omega: number[] = [];
  for (let i = 0; i < n; i++) {
    k1Phi.push(state.pendula[i].omega);
    k1Omega.push(computeAcceleration(i, state.pendula, params, t));
  }
  
  // k2 - state at t + dt/2 using k1
  const pendula2: PendulumState[] = state.pendula.map((p, i) => ({
    phi: p.phi + 0.5 * dt * k1Phi[i],
    omega: p.omega + 0.5 * dt * k1Omega[i]
  }));
  const k2Phi: number[] = [];
  const k2Omega: number[] = [];
  for (let i = 0; i < n; i++) {
    k2Phi.push(pendula2[i].omega);
    k2Omega.push(computeAcceleration(i, pendula2, params, t + 0.5 * dt));
  }
  
  // k3 - state at t + dt/2 using k2
  const pendula3: PendulumState[] = state.pendula.map((p, i) => ({
    phi: p.phi + 0.5 * dt * k2Phi[i],
    omega: p.omega + 0.5 * dt * k2Omega[i]
  }));
  const k3Phi: number[] = [];
  const k3Omega: number[] = [];
  for (let i = 0; i < n; i++) {
    k3Phi.push(pendula3[i].omega);
    k3Omega.push(computeAcceleration(i, pendula3, params, t + 0.5 * dt));
  }
  
  // k4 - state at t + dt using k3
  const pendula4: PendulumState[] = state.pendula.map((p, i) => ({
    phi: p.phi + dt * k3Phi[i],
    omega: p.omega + dt * k3Omega[i]
  }));
  const k4Phi: number[] = [];
  const k4Omega: number[] = [];
  for (let i = 0; i < n; i++) {
    k4Phi.push(pendula4[i].omega);
    k4Omega.push(computeAcceleration(i, pendula4, params, t + dt));
  }
  
  // Combine
  const newPendula: PendulumState[] = state.pendula.map((p, i) => ({
    phi: p.phi + (dt / 6) * (k1Phi[i] + 2 * k2Phi[i] + 2 * k3Phi[i] + k4Phi[i]),
    omega: p.omega + (dt / 6) * (k1Omega[i] + 2 * k2Omega[i] + 2 * k3Omega[i] + k4Omega[i])
  }));
  
  // Normalize angles to [-π, π] for visualization purposes
  for (const p of newPendula) {
    while (p.phi > Math.PI) p.phi -= 2 * Math.PI;
    while (p.phi < -Math.PI) p.phi += 2 * Math.PI;
  }
  
  const newTime = t + dt;
  
  // Calculate pivot position for visualization
  // Pivot oscillates as a*cos(ωt), we scale for visualization
  const amplitude = params.g1 / (params.drivingFreq * params.drivingFreq);
  const pivotY = amplitude * Math.cos(params.drivingFreq * newTime);
  
  return {
    pendula: newPendula,
    time: newTime,
    pivotY
  };
}

/**
 * Initialize the simulation state
 */
export function initializeState(params: SimulationParams): SimulationState {
  const pendula: PendulumState[] = [];
  
  for (let i = 0; i < params.numPendula; i++) {
    // Start near inverted position (φ = π) with small random perturbation
    const perturbation = (Math.random() - 0.5) * 0.3;
    pendula.push({
      phi: Math.PI + perturbation,
      omega: 0
    });
  }
  
  return {
    pendula,
    time: 0,
    pivotY: 0
  };
}

/**
 * Calculate stability metrics
 */
export function calculateMetrics(state: SimulationState): {
  avgAngle: number;
  angleSpread: number;
  isStable: boolean;
  oscillatingCount: number;
  rotatingCount: number;
} {
  const angles = state.pendula.map(p => p.phi);
  const velocities = state.pendula.map(p => Math.abs(p.omega));
  
  // Average angle from inverted position
  const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
  
  // Spread in angles
  const angleSpread = Math.sqrt(
    angles.reduce((sum, phi) => sum + Math.pow(phi - avgAngle, 2), 0) / angles.length
  );
  
  // Count oscillating vs rotating pendula
  // Rotating if |ω| is consistently high
  let oscillatingCount = 0;
  let rotatingCount = 0;
  
  for (let i = 0; i < state.pendula.length; i++) {
    if (velocities[i] > 3.0) {
      rotatingCount++;
    } else {
      oscillatingCount++;
    }
  }
  
  // System is stable if most pendula are near inverted and not rotating
  const nearInverted = angles.filter(phi => Math.abs(phi - Math.PI) < 0.5 || Math.abs(phi + Math.PI) < 0.5).length;
  const isStable = nearInverted > state.pendula.length * 0.5 && rotatingCount < state.pendula.length * 0.3;
  
  return {
    avgAngle,
    angleSpread,
    isStable,
    oscillatingCount,
    rotatingCount
  };
}

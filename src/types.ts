// Types for the Coupled Kapitza Pendulum Simulation

export interface PendulumState {
  phi: number;      // angle (radians)
  omega: number;    // angular velocity (rad/s)
}

export interface SimulationParams {
  g0: number;        // g/l - gravitational parameter
  g1: number;        // aω²/l - driving amplitude parameter  
  drivingFreq: number;  // ω - driving frequency
  coupling: number;     // Λ - coupling strength
  damping: number;      // damping coefficient
  numPendula: number;   // N - number of pendula
  couplingType: 'nearest' | 'all-to-all';  // coupling topology
}

export interface SimulationState {
  pendula: PendulumState[];
  time: number;
  pivotY: number;    // Current pivot position for visualization
}

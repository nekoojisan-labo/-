export const GAME_CONSTANTS = {
  TOTAL_DISTANCE: 100,
  MOVEMENT_SPEED: 0.4, // Progress per tick
  TICK_RATE: 16, // ~60fps
  
  // --- Difficulty Scaling ---
  // Values interpolate from START (at 0% progress) to END (at 100% progress)
  
  // How long the cat sleeps
  SLEEP_MIN_START: 2000, 
  SLEEP_MIN_END: 800,    // Gets very short near the end
  
  SLEEP_MAX_START: 5000,
  SLEEP_MAX_END: 2500,

  // Warning phase (Yellow !) duration - The reaction time allowed
  WARN_TIME_START: 1500, // Generous at start
  WARN_TIME_END: 600,    // Requires fast reflexes at end
  WARN_VARIANCE: 300,    // Random +/- variation to prevent rhythm counting

  // How long the cat stays awake watching
  AWAKE_MIN: 2000,
  AWAKE_MAX: 4500,
  
  GRACE_PERIOD: 300, // Time allowed to stop moving after awake (lag compensation)
};
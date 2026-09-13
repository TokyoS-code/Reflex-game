export const GAME_CONFIG = {
  blockDurationMs: 700,
  totalCooldownMs: 1000,

  soloInitialSpeed: 900,
  multiplayerInitialSpeed: 430,

  soloSpeedIncrease: 0.37,
  multiplayerSpeedIncrease: 0.035,

  returnSpeedMultiplier: 1.35,

  minWaitMs: 600,
  maxWaitMs: 3000,
  multiplayerStartDelayMs: 900,

  botBlockFlashMs: 180,

  ballOriginY: 92,
} as const;

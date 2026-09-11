export const GAME_CONFIG = {
  blockDurationMs: 700,
  totalCooldownMs: 1000,

  soloInitialSpeed: 500,
  multiplayerInitialSpeed: 430,

  soloSpeedIncrease: 0.08,
  multiplayerSpeedIncrease: 0.035,

  returnSpeedMultiplier: 1.35,

  minWaitMs: 700,
  maxWaitMs: 3000,
  multiplayerStartDelayMs: 900,

  botBlockFlashMs: 180,

  ballOriginY: 92,
} as const;

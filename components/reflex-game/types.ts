export type GameMode = "solo" | "bots";

export type TargetId = "player" | string;

export type GameStatus =
  | "waiting"
  | "attacking"
  | "returning"
  | "game-over";

export interface GameSetup {
  mode: GameMode;
  botCount: number;
}

export interface GameSnapshot {
  score: number;
  speedMultiplier: number;
  bestReactionMs: number | null;
  blocking: boolean;
  canBlock: boolean;
  blockProgress: number;
  status: GameStatus;
  targetId: string | null;
  totalDeflections: number;
}

export interface BotViewState {
  id: string;
  blocking: boolean;
  x: number;
  y: number;
}

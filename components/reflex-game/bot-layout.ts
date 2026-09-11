export interface BotPosition {
  x: number;
  y: number;
}

const POSITIONS: BotPosition[] = [
  { x: 18, y: 27 },
  { x: 50, y: 22 },
  { x: 82, y: 27 },
  { x: 24, y: 52 },
  { x: 76, y: 52 },
  { x: 50, y: 49 },
  { x: 11, y: 64 },
  { x: 89, y: 64 },
];

export function getBotPositions(count: number) {
  return POSITIONS.slice(0, Math.max(0, Math.min(count, POSITIONS.length)));
}

import type { GameMode, GameSnapshot } from "./types";
import styles from "./reflex-game.module.css";

interface GameHudProps {
  snapshot: GameSnapshot;
  mode: GameMode;
}

export default function GameHud({ snapshot, mode }: GameHudProps) {
  return (
    <div className={styles.hud}>
      <div className={styles.stat}>
        <span>DEFESAS</span>
        <strong>{snapshot.score}</strong>
      </div>

      <div className={styles.stat}>
        <span>VELOCIDADE</span>
        <strong>{snapshot.speedMultiplier.toFixed(2)}x</strong>
      </div>

      <div className={styles.stat}>
        <span>MELHOR TEMPO</span>
        <strong>
          {snapshot.bestReactionMs === null
            ? "---"
            : `${Math.round(snapshot.bestReactionMs)}ms`}
        </strong>
      </div>

      {mode === "bots" && (
        <div className={`${styles.stat} ${styles.optionalStat}`}>
          <span>TROCAS</span>
          <strong>{snapshot.totalDeflections}</strong>
        </div>
      )}
    </div>
  );
}

import type { BotViewState } from "./types";
import styles from "./reflex-game.module.css";

interface BotPlayerProps {
  bot: BotViewState;
  targeted: boolean;
  setRef: (id: string, node: HTMLDivElement | null) => void;
}

export default function BotPlayer({ bot, targeted, setRef }: BotPlayerProps) {
  return (
    <div
      className={styles.botAnchor}
      style={{ left: `${bot.x}%`, top: `${bot.y}%` }}
    >
      <div
        className={`${styles.botShield} ${bot.blocking ? styles.botShieldActive : ""}`}
        aria-hidden="true"
      />

      <div
        ref={(node) => setRef(bot.id, node)}
        className={`${styles.bot} ${bot.blocking ? styles.botBlocking : ""} ${targeted ? styles.botTargeted : ""}`}
        aria-label={`Bot ${bot.id}`}
      >
        <span className={styles.botCore} />
      </div>
    </div>
  );
}

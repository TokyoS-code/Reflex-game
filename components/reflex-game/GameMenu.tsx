"use client";

import { useState } from "react";
import type { GameSetup } from "./types";
import styles from "./reflex-game.module.css";

interface GameMenuProps {
  onStart: (setup: GameSetup) => void;
}

const BOT_COUNTS = [3, 5, 7];

export default function GameMenu({ onStart }: GameMenuProps) {
  const [botCount, setBotCount] = useState(5);

  return (
    <main className={styles.menuScreen}>
      <div className={styles.menuGlow} aria-hidden="true" />

      <section className={styles.menuPanel}>
        <div className={styles.menuHeader}>
          <span className={styles.eyebrow}>REFLEX TRAINING</span>
          <h1>Escolha seu modo</h1>
          <p>
            Treine o timing sozinho ou entre em uma troca de defesas contra bots.
          </p>
        </div>

        <div className={styles.modeGrid}>
          <button
            type="button"
            className={styles.modeCard}
            onClick={() => onStart({ mode: "solo", botCount: 0 })}
          >
            <span className={styles.modeTag}>SOLO</span>
            <strong>Reflexo puro</strong>
            <p>
              A bola parte do topo, você defende e ela retorna animada antes do próximo ataque.
            </p>
            <span className={styles.playLabel}>JOGAR SOLO →</span>
          </button>

          <div className={`${styles.modeCard} ${styles.multiplayerCard}`}>
            <span className={styles.modeTag}>BOTS</span>
            <strong>Troca aleatória</strong>
            <p>
              A bola escolhe jogadores aleatoriamente. Bots sempre defendem; quando vier em você, reaja.
            </p>

            <div className={styles.botSelector}>
              <span>Bots</span>
              <div>
                {BOT_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={botCount === count ? styles.botCountActive : ""}
                    onClick={() => setBotCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryPlayButton}
              onClick={() => onStart({ mode: "bots", botCount })}
            >
              JOGAR COM BOTS →
            </button>
          </div>
        </div>

        <div className={styles.menuFooter}>
          <span>Desktop: clique esquerdo ou E</span>
          <span>Celular: toque na tela ou DEFENDER</span>
        </div>
      </section>
    </main>
  );
}

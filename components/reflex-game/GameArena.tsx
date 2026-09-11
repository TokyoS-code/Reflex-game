"use client";

import { useReflexGame } from "@/hooks/useReflexGame";
import BotPlayer from "./BotPlayer";
import GameHud from "./GameHud";
import MobileControls from "./MobileControls";
import type { GameSetup } from "./types";
import styles from "./reflex-game.module.css";

interface GameArenaProps {
  setup: GameSetup;
  onBackToMenu: () => void;
}

export default function GameArena({ setup, onBackToMenu }: GameArenaProps) {
  const {
    gameRef,
    ballRef,
    playerRef,
    bots,
    setBotRef,
    snapshot,
    message,
    block,
    restart,
  } = useReflexGame(setup);

  const isGameOver = snapshot.status === "game-over";
  const playerTargeted = setup.mode === "bots" && snapshot.targetId === "player";

  return (
    <main
      ref={gameRef}
      className={styles.game}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if ((event.target as HTMLElement).closest("button")) return;
        block();
      }}
    >
      <GameHud snapshot={snapshot} mode={setup.mode} />

      <button
        type="button"
        className={styles.menuButton}
        onClick={onBackToMenu}
      >
        MENU
      </button>

      <div ref={ballRef} className={styles.ball} aria-hidden="true" />

      {setup.mode === "bots" &&
        bots.map((bot) => (
          <BotPlayer
            key={bot.id}
            bot={bot}
            targeted={snapshot.targetId === bot.id}
            setRef={setBotRef}
          />
        ))}

      <div
        className={`${styles.shield} ${snapshot.blocking ? styles.shieldActive : ""}`}
        aria-hidden="true"
      />

      <div
        ref={playerRef}
        className={`${styles.player} ${snapshot.blocking ? styles.playerBlocking : ""} ${playerTargeted ? styles.playerTargeted : ""}`}
        aria-label="Jogador"
      >
        <span className={styles.playerCore} />
      </div>

      <div className={styles.blockBarTrack} aria-hidden="true">
        <div
          className={styles.blockBar}
          style={{ transform: `scaleX(${snapshot.blockProgress})` }}
        />
      </div>

      {message && (
        <div
          className={`${styles.message}`}
        >
          {message}
        </div>
      )}

      <div className={styles.instructions}>
        <span className={styles.desktopHint}>
          Clique esquerdo ou pressione E para bloquear
        </span>
        <span className={styles.mobileHint}>Toque na tela ou use DEFENDER</span>
        <small>
          {setup.mode === "solo"
            ? "Janela ativa: 0,7s"
            : "A bola muda de alvo após cada defesa"}
        </small>
      </div>

      <MobileControls disabled={!snapshot.canBlock || isGameOver} onBlock={block} />

      {isGameOver && (
        <div className={styles.overlay}>
          <div className={styles.gameOverCard}>
            <span className={styles.eyebrow}>
              {setup.mode === "solo" ? "SOLO" : "BOTS"}
            </span>
            <h1>VOCÊ FOI ATINGIDO</h1>
            <p>
              Suas defesas: <strong>{snapshot.score}</strong>
            </p>
            {setup.mode === "bots" && (
              <p>
                Trocas da rodada: <strong>{snapshot.totalDeflections}</strong>
              </p>
            )}
            <p>
              Velocidade final: <strong>{snapshot.speedMultiplier.toFixed(2)}x</strong>
            </p>

            <div className={styles.gameOverActions}>
              <button type="button" onClick={restart}>
                TENTAR NOVAMENTE
              </button>
              <button type="button" className={styles.secondaryButton} onClick={onBackToMenu}>
                VOLTAR AO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

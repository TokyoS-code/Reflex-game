"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBotPositions } from "@/components/reflex-game/bot-layout";
import { GAME_CONFIG } from "@/components/reflex-game/config";
import type {
  BotViewState,
  GameSetup,
  GameSnapshot,
} from "@/components/reflex-game/types";

interface Point {
  x: number;
  y: number;
}

function makeInitialSnapshot(): GameSnapshot {
  return {
    score: 0,
    speedMultiplier: 1,
    bestReactionMs: null,
    blocking: false,
    canBlock: true,
    blockProgress: 0,
    status: "waiting",
    targetId: null,
    totalDeflections: 0,
  };
}

export function useReflexGame(setup: GameSetup) {
  const gameRef = useRef<HTMLElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const botRefs = useRef(new Map<string, HTMLDivElement>());

  const botPositions = useMemo(
    () => getBotPositions(setup.mode === "bots" ? setup.botCount : 0),
    [setup.botCount, setup.mode],
  );

  const botIds = useMemo(
    () => botPositions.map((_, index) => `bot-${index + 1}`),
    [botPositions],
  );

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => makeInitialSnapshot());
  const [message, setMessage] = useState("");
  const [blockingBots, setBlockingBots] = useState<Set<string>>(() => new Set());

  const animationRef = useRef<number | null>(null);
  const attackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botFlashTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const ballPositionRef = useRef<Point>({ x: 0, y: GAME_CONFIG.ballOriginY });
  const scoreRef = useRef(0);
  const totalDeflectionsRef = useRef(0);
  const speedRef = useRef(1);
  const bestReactionRef = useRef<number | null>(null);
  const blockingRef = useRef(false);
  const canBlockRef = useRef(true);
  const statusRef = useRef<GameSnapshot["status"]>("waiting");
  const targetIdRef = useRef<string | null>(null);
  const blockStartRef = useRef(0);
  const attackStartRef = useRef(0);
  const lastFrameRef = useRef(0);

  const clearTimer = useCallback(
    (timer: { current: ReturnType<typeof setTimeout> | null }) => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    },
    [],
  );

  const syncSnapshot = useCallback((patch: Partial<GameSnapshot>) => {
    setSnapshot((current) => ({ ...current, ...patch }));
  }, []);

  const renderBall = useCallback((position: Point) => {
    if (!ballRef.current) return;

    ballRef.current.style.transform =
      `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;
  }, []);

  const getOrigin = useCallback((): Point => {
    const width = gameRef.current?.getBoundingClientRect().width ?? window.innerWidth;

    return {
      x: width / 2,
      y: GAME_CONFIG.ballOriginY,
    };
  }, []);

  const resetBallToOrigin = useCallback(() => {
    const origin = getOrigin();
    ballPositionRef.current = origin;
    renderBall(origin);
  }, [getOrigin, renderBall]);

  const showMessage = useCallback(
    (text: string) => {
      clearTimer(messageTimerRef);
      setMessage(text);
      messageTimerRef.current = setTimeout(() => setMessage(""), 350);
    },
    [clearTimer],
  );

  const setBotRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) botRefs.current.set(id, node);
    else botRefs.current.delete(id);
  }, []);

  const getEntityRect = useCallback((id: string) => {
    if (id === "player") return playerRef.current?.getBoundingClientRect() ?? null;
    return botRefs.current.get(id)?.getBoundingClientRect() ?? null;
  }, []);

  const getEntityCenter = useCallback(
    (id: string): Point | null => {
      const entityRect = getEntityRect(id);
      const gameRect = gameRef.current?.getBoundingClientRect();

      if (!entityRect || !gameRect) return null;

      return {
        x: entityRect.left - gameRect.left + entityRect.width / 2,
        y: entityRect.top - gameRect.top + entityRect.height / 2,
      };
    },
    [getEntityRect],
  );

  const chooseRandomTarget = useCallback(
    (excludeId?: string) => {
      const candidates = ["player", ...botIds].filter((id) => id !== excludeId);
      if (candidates.length === 0) return "player";
      return candidates[Math.floor(Math.random() * candidates.length)];
    },
    [botIds],
  );

  const targetEntity = useCallback(
    (id: string) => {
      targetIdRef.current = id;
      attackStartRef.current = performance.now();
      statusRef.current = "attacking";
      syncSnapshot({ status: "attacking", targetId: id });
    },
    [syncSnapshot],
  );

  const scheduleAttack = useCallback(() => {
    clearTimer(attackTimerRef);

    statusRef.current = "waiting";
    targetIdRef.current = null;
    syncSnapshot({ status: "waiting", targetId: null });

    const delay =
      setup.mode === "bots"
        ? GAME_CONFIG.multiplayerStartDelayMs
        : Math.random() * (GAME_CONFIG.maxWaitMs - GAME_CONFIG.minWaitMs) +
          GAME_CONFIG.minWaitMs;

    attackTimerRef.current = setTimeout(() => {
      if (statusRef.current === "game-over") return;

      const nextTarget = setup.mode === "bots" ? chooseRandomTarget() : "player";
      targetEntity(nextTarget);
    }, delay);
  }, [chooseRandomTarget, clearTimer, setup.mode, syncSnapshot, targetEntity]);

  const stopBlocking = useCallback(() => {
    blockingRef.current = false;
    syncSnapshot({ blocking: false, blockProgress: 0 });
  }, [syncSnapshot]);

  const releasePlayerBlockImmediately = useCallback(() => {
    clearTimer(blockEndTimerRef);
    clearTimer(cooldownTimerRef);

    blockingRef.current = false;
    canBlockRef.current = true;

    syncSnapshot({
      blocking: false,
      canBlock: true,
      blockProgress: 0,
    });
  }, [clearTimer, syncSnapshot]);

  const flashBotBlock = useCallback((id: string) => {
    const currentTimer = botFlashTimersRef.current.get(id);
    if (currentTimer) clearTimeout(currentTimer);

    setBlockingBots((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    const timer = setTimeout(() => {
      setBlockingBots((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      botFlashTimersRef.current.delete(id);
    }, GAME_CONFIG.botBlockFlashMs);

    botFlashTimersRef.current.set(id, timer);
  }, []);

  const redirectMultiplayerBall = useCallback(
    (defenderId: string) => {
      speedRef.current += GAME_CONFIG.multiplayerSpeedIncrease;
      totalDeflectionsRef.current += 1;

      const nextTarget = chooseRandomTarget(defenderId);

      targetIdRef.current = nextTarget;
      attackStartRef.current = performance.now();
      statusRef.current = "attacking";

      syncSnapshot({
        speedMultiplier: speedRef.current,
        totalDeflections: totalDeflectionsRef.current,
        status: "attacking",
        targetId: nextTarget,
      });
    },
    [chooseRandomTarget, syncSnapshot],
  );

  const onSuccessfulPlayerBlock = useCallback(() => {
    const inputReaction = blockStartRef.current - attackStartRef.current;
    const validReaction = inputReaction >= 0 ? inputReaction : null;

    if (validReaction !== null) {
      bestReactionRef.current =
        bestReactionRef.current === null
          ? validReaction
          : Math.min(bestReactionRef.current, validReaction);
    }

    scoreRef.current += 1;
    releasePlayerBlockImmediately();
  

    if (setup.mode === "solo") {
      speedRef.current += GAME_CONFIG.soloSpeedIncrease;
      statusRef.current = "returning";
      targetIdRef.current = null;

      syncSnapshot({
        score: scoreRef.current,
        speedMultiplier: speedRef.current,
        bestReactionMs: bestReactionRef.current,
        status: "returning",
        targetId: null,
      });
      return;
    }

    syncSnapshot({
      score: scoreRef.current,
      bestReactionMs: bestReactionRef.current,
    });

    redirectMultiplayerBall("player");
  }, [redirectMultiplayerBall, releasePlayerBlockImmediately, setup.mode, showMessage, syncSnapshot]);

  const onBotBlock = useCallback(
    (id: string) => {
      flashBotBlock(id);
      redirectMultiplayerBall(id);
    },
    [flashBotBlock, redirectMultiplayerBall],
  );

  const onPlayerHit = useCallback(() => {
    statusRef.current = "game-over";
    targetIdRef.current = null;
    blockingRef.current = false;
    canBlockRef.current = false;

    clearTimer(attackTimerRef);
    clearTimer(blockEndTimerRef);
    clearTimer(cooldownTimerRef);

    syncSnapshot({
      status: "game-over",
      targetId: null,
      blocking: false,
      canBlock: false,
      blockProgress: 0,
    });

    showMessage("ATINGIDO");
  }, [clearTimer, showMessage, syncSnapshot]);

  const block = useCallback(() => {
    if (statusRef.current === "game-over" || !canBlockRef.current) return;

    canBlockRef.current = false;
    blockingRef.current = true;
    blockStartRef.current = performance.now();

    syncSnapshot({ blocking: true, canBlock: false, blockProgress: 1 });

    clearTimer(blockEndTimerRef);
    clearTimer(cooldownTimerRef);

    blockEndTimerRef.current = setTimeout(() => {
      stopBlocking();
    }, GAME_CONFIG.blockDurationMs);

    cooldownTimerRef.current = setTimeout(() => {
      canBlockRef.current = true;
      syncSnapshot({ canBlock: true });
    }, GAME_CONFIG.totalCooldownMs);
  }, [clearTimer, stopBlocking, syncSnapshot]);

  const restart = useCallback(() => {
    clearTimer(attackTimerRef);
    clearTimer(blockEndTimerRef);
    clearTimer(cooldownTimerRef);
    clearTimer(messageTimerRef);

    botFlashTimersRef.current.forEach((timer) => clearTimeout(timer));
    botFlashTimersRef.current.clear();

    scoreRef.current = 0;
    totalDeflectionsRef.current = 0;
    speedRef.current = 1;
    bestReactionRef.current = null;
    blockingRef.current = false;
    canBlockRef.current = true;
    statusRef.current = "waiting";
    targetIdRef.current = null;
    lastFrameRef.current = performance.now();

    setMessage("");
    setBlockingBots(new Set());
    setSnapshot(makeInitialSnapshot());

    resetBallToOrigin();
    scheduleAttack();
  }, [clearTimer, resetBallToOrigin, scheduleAttack]);

  useEffect(() => {
    resetBallToOrigin();
    lastFrameRef.current = performance.now();
    scheduleAttack();

    const loop = (now: number) => {
      const delta = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;

      if (statusRef.current === "attacking" && targetIdRef.current) {
        const targetId = targetIdRef.current;
        const targetCenter = getEntityCenter(targetId);
        const targetRect = getEntityRect(targetId);
        const ballRect = ballRef.current?.getBoundingClientRect();

        if (targetCenter && targetRect && ballRect) {
          const current = ballPositionRef.current;
          const dx = targetCenter.x - current.x;
          const dy = targetCenter.y - current.y;
          const distance = Math.hypot(dx, dy);
          const collisionDistance = targetRect.width / 2 + ballRect.width / 2;

          const baseSpeed =
            setup.mode === "solo"
              ? GAME_CONFIG.soloInitialSpeed
              : GAME_CONFIG.multiplayerInitialSpeed;

          const step = baseSpeed * speedRef.current * delta;
          const distanceToContact = Math.max(0, distance - collisionDistance);

          if (distance <= collisionDistance || step >= distanceToContact) {
            if (distance > 0 && distanceToContact > 0) {
              const travel = Math.min(step, distanceToContact);
              const nextPosition = {
                x: current.x + (dx / distance) * travel,
                y: current.y + (dy / distance) * travel,
              };
              ballPositionRef.current = nextPosition;
              renderBall(nextPosition);
            }

            if (targetId === "player") {
              if (blockingRef.current) onSuccessfulPlayerBlock();
              else onPlayerHit();
            } else {
              onBotBlock(targetId);
            }
          } else if (distance > 0) {
            const nextPosition = {
              x: current.x + (dx / distance) * step,
              y: current.y + (dy / distance) * step,
            };

            ballPositionRef.current = nextPosition;
            renderBall(nextPosition);
          }
        }
      }

      if (statusRef.current === "returning") {
        const current = ballPositionRef.current;
        const origin = getOrigin();
        const dx = origin.x - current.x;
        const dy = origin.y - current.y;
        const distance = Math.hypot(dx, dy);
        const step =
          GAME_CONFIG.soloInitialSpeed *
          speedRef.current *
          GAME_CONFIG.returnSpeedMultiplier *
          delta;

        if (distance <= step || distance < 1) {
          ballPositionRef.current = origin;
          renderBall(origin);
          scheduleAttack();
        } else {
          const nextPosition = {
            x: current.x + (dx / distance) * step,
            y: current.y + (dy / distance) * step,
          };

          ballPositionRef.current = nextPosition;
          renderBall(nextPosition);
        }
      }

      if (blockingRef.current) {
        const elapsed = now - blockStartRef.current;
        const progress = Math.max(0, 1 - elapsed / GAME_CONFIG.blockDurationMs);
        setSnapshot((current) => ({ ...current, blockProgress: progress }));
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      if (statusRef.current === "waiting") resetBallToOrigin();
    };

    window.addEventListener("resize", onResize);

    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", onResize);

      clearTimer(attackTimerRef);
      clearTimer(blockEndTimerRef);
      clearTimer(cooldownTimerRef);
      clearTimer(messageTimerRef);

      botFlashTimersRef.current.forEach((timer) => clearTimeout(timer));
      botFlashTimersRef.current.clear();
    };
  }, [
    clearTimer,
    getEntityCenter,
    getEntityRect,
    getOrigin,
    onBotBlock,
    onPlayerHit,
    onSuccessfulPlayerBlock,
    renderBall,
    resetBallToOrigin,
    scheduleAttack,
    setup.mode,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat) return;
      block();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [block]);

  const bots: BotViewState[] = botPositions.map((position, index) => ({
    id: botIds[index],
    blocking: blockingBots.has(botIds[index]),
    x: position.x,
    y: position.y,
  }));

  return {
    gameRef,
    ballRef,
    playerRef,
    bots,
    setBotRef,
    snapshot,
    message,
    block,
    restart,
  };
}

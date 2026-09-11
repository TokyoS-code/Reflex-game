"use client";

import { useState } from "react";
import GameArena from "./GameArena";
import GameMenu from "./GameMenu";
import type { GameSetup } from "./types";

export default function ReflexGame() {
  const [setup, setSetup] = useState<GameSetup | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  if (!setup) {
    return <GameMenu onStart={setSetup} />;
  }

  return <GameArena setup={setup} onBackToMenu={() => setSetup(null)} />;
}

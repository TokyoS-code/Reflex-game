# Reflex Training

Treino de reflexo feito com Next.js, React e TypeScript, sem bibliotecas visuais extras.

## Modos

### Solo
- A bola espera um tempo aleatório e ataca o jogador.
- Bloqueio com clique esquerdo, tecla `E` ou toque no celular.
- Janela de defesa: 700 ms.
- Cooldown total quando o timing não acerta: 1 segundo.
- Ao defender, a bola retorna animada até a origem.
- A velocidade aumenta a cada defesa.

### Bots
- Escolha 3, 5 ou 7 bots.
- A bola viaja em 2D entre os jogadores.
- Depois de cada defesa, um novo alvo é escolhido aleatoriamente.
- Bots sempre defendem automaticamente.
- Quando o alvo é o jogador, é necessário bloquear manualmente.
- A velocidade aumenta progressivamente durante a troca.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Estrutura principal

- `components/reflex-game/GameMenu.tsx`: menu e escolha do modo.
- `components/reflex-game/GameArena.tsx`: arena e renderização da partida.
- `components/reflex-game/BotPlayer.tsx`: representação visual dos bots.
- `hooks/useReflexGame.ts`: engine e regras do jogo.
- `components/reflex-game/config.ts`: tempos, velocidades e dificuldade.
- `components/reflex-game/bot-layout.ts`: posições dos bots.

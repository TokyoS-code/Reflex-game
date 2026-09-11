import styles from "./reflex-game.module.css";

interface MobileControlsProps {
  disabled: boolean;
  onBlock: () => void;
}

export default function MobileControls({ disabled, onBlock }: MobileControlsProps) {
  return (
    <button
      type="button"
      className={styles.mobileBlockButton}
      disabled={disabled}
      onPointerDown={(event) => {
        event.preventDefault();
        onBlock();
      }}
    >
      DEFENDER
    </button>
  );
}

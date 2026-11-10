import { Coins } from "lucide-react";
import { Card, SectionHeader, EditableNumber } from "../ui";
import { COINS, COIN_STYLES } from "./consts";

export function CoinDisplay({ label, color, value, onChange }) {
  return (
    <div className={COIN_STYLES.container}>
      <span 
        className={COIN_STYLES.label} 
        style={{ color, fontFamily: COIN_STYLES.labelFont }}
      >
        {label}
      </span>
      <EditableNumber 
        value={value} 
        onChange={onChange} 
        className="text-lg font-bold" 
        min={0} 
      />
    </div>
  );
}

/**
 * Seção de moedas do inventário
 */
export function CoinsSection({ data, onUpdate }) {
  return (
    <Card>
      <SectionHeader title="Moedas" icon={<Coins size={14} />} />
      <div className="grid grid-cols-4 gap-3">
        {COINS.map(({ label, key, color }) => (
          <CoinDisplay
            key={key}
            label={label}
            color={color}
            value={data[key]}
            onChange={(value) => onUpdate(key, value)}
          />
        ))}
      </div>
    </Card>
  );
}

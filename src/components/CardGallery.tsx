import type { Card } from "../types/card";
import { CardTile } from "./CardTile";

interface Props {
  cards: Card[];
  onDelete: (id: string) => void;
}

export function CardGallery({ cards, onDelete }: Props) {
  if (cards.length === 0) {
    return <p className="gallery-empty">Your binder is empty. Add your first card above.</p>;
  }
  return (
    <div className="gallery">
      {cards.map((card) => (
        <CardTile key={card.id} card={card} onDelete={onDelete} />
      ))}
    </div>
  );
}
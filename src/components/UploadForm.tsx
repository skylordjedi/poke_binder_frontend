import { useState, type FormEvent, type ChangeEvent } from "react";
import type { CardCondition, NewCardInput } from "../types/card";
import type { IdentifyMatch } from "../types/identify";

const CONDITIONS: CardCondition[] = ["MINT", "NEAR_MINT", "EXCELLENT", "GOOD", "PLAYED", "POOR"];

interface Props {
  onSubmit: (input: NewCardInput) => Promise<void>;
  initialImage?: File;
  initialValues?: { name?: string; setName?: string; cardNumber?: string; rarity?: string };
  identifyCandidates?: IdentifyMatch[];
  onCancel?: () => void;
}

export function UploadForm({ onSubmit, initialImage, initialValues, identifyCandidates, onCancel }: Props) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [setNameValue, setSetNameValue] = useState(initialValues?.setName ?? "");
  const [cardNumber, setCardNumber] = useState(initialValues?.cardNumber ?? "");
  const [rarity, setRarity] = useState(initialValues?.rarity ?? "");
  const [condition, setCondition] = useState<CardCondition>("NEAR_MINT");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(initialImage ?? null);
  const [preview, setPreview] = useState<string | null>(initialImage ? URL.createObjectURL(initialImage) : null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Add a photo of the card.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name,
        setName: setNameValue,
        cardNumber: cardNumber || undefined,
        rarity: rarity || undefined,
        condition,
        quantity: Number(quantity) || 1,
        notes: notes || undefined,
        image,
        identifyCandidates,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add card.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      {onCancel && (
        <button type="button" className="upload-form__cancel" onClick={onCancel}>
          ← Scan a different card
        </button>
      )}
      <label className="upload-form__photo" htmlFor="image">
        {preview ? <img src={preview} alt="Card preview" /> : <span>Add photo</span>}
      </label>
      <input id="image" type="file" accept="image/*" onChange={handleFileChange} hidden />

      <div className="upload-form__fields">
        <input placeholder="Card name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Set" value={setNameValue} onChange={(e) => setSetNameValue(e.target.value)} required />
        <input placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
        <input placeholder="Rarity" value={rarity} onChange={(e) => setRarity(e.target.value)} />
        <select value={condition} onChange={(e) => setCondition(e.target.value as CardCondition)}>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c.replace("_", " ")}</option>
          ))}
        </select>
        <input type="number" min={1} placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

        {error && <p className="upload-form__error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add to binder"}
        </button>
      </div>
    </form>
  );
}
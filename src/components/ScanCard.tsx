import { useState, ChangeEvent } from "react";
import { identifyCard } from "../api/identify";
import type { IdentifyMatch } from "../types/identify";

const CONFIDENCE_THRESHOLD = 0.85;

interface Props {
  onConfirmed: (match: IdentifyMatch, candidates: IdentifyMatch[], photo: File) => void;
  onManualEntry: (photo: File) => void;
}

type Status = "idle" | "scanning" | "confirming" | "error";

export function ScanCard({ onConfirmed, onManualEntry }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [topMatch, setTopMatch] = useState<IdentifyMatch | null>(null);
  const [candidates, setCandidates] = useState<IdentifyMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStatus("scanning");
    setError(null);

    try {
      const result = await identifyCard(file);
      const best = result.matches[0];

      if (best) {
        setTopMatch(best);
        setCandidates(result.matches);
        setStatus("confirming");
      } else {
        // Not confident enough to guess — go straight to manual entry
        // rather than presenting a match we're not sure about.
        onManualEntry(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not scan that card.");
      setStatus("error");
    }
  }

  function handleConfirm() {
    if (photo && topMatch) onConfirmed(topMatch, candidates, photo);
  }

  function handleReject() {
    if (photo) onManualEntry(photo);
  }

  if (status === "scanning") {
    return (
      <div className="scan-card scan-card--loading">
        {photoPreview && <img src={photoPreview} alt="Scanning" className="scan-card__preview" />}
        <p>Reading the card…</p>
      </div>
    );
  }

  if (status === "confirming" && topMatch) {
    return (
      <div className="scan-card scan-card--confirm">
        <p className="scan-card__question">Is this your card?</p>
        <div className="scan-card__compare">
          {photoPreview && <img src={photoPreview} alt="Your photo" className="scan-card__yours" />}
          <img src={topMatch.images.small} alt={topMatch.name} className="scan-card__match" />
        </div>
        <p className="scan-card__match-name">
          {topMatch.name} — {topMatch.set.name} (#{topMatch.number})
        </p>
        <div className="scan-card__actions">
          <button onClick={handleConfirm} className="scan-card__yes">Yes, that's it</button>
          <button onClick={handleReject} className="scan-card__no">Not quite — enter manually</button>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-card scan-card--idle">
      <label htmlFor="scan-input" className="scan-card__upload">Scan a card</label>
      <input id="scan-input" type="file" accept="image/*" onChange={handleFileChange} hidden />
      {status === "error" && <p className="scan-card__error">{error} — try again, or add it manually below.</p>}
    </div>
  );
}
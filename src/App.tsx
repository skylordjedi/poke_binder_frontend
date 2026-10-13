import { useState } from "react";
import { useCards } from "./hooks/useCards";
import { ScanCard } from "./components/ScanCard";
import { UploadForm } from "./components/UploadForm";
import { CardGallery } from "./components/CardGallery";
import type { IdentifyMatch } from "./types/identify";
import "./index.css";

type Stage =
  | { kind: "scan" }
  | {
      kind: "form";
      key: number;
      photo: File;
      prefill?: { name?: string; setName?: string; cardNumber?: string; rarity?: string };
      candidates?: IdentifyMatch[];
    };

function App() {
  const { cards, loading, error, addCard, removeCard } = useCards();
  const [stage, setStage] = useState<Stage>({ kind: "scan" });
  const [formKey, setFormKey] = useState(0);

  
  function handleConfirmed(match: IdentifyMatch, candidates: IdentifyMatch[], photo: File) {
    console.log("confirmed match:", match);
    setFormKey((k) => k + 1);
    setStage({
      kind: "form",
      key: formKey,
      photo,
      prefill: { name: match.name, setName: match.set.name, cardNumber: match.number, rarity: match.rarity ?? undefined },
      candidates,
    });
  }

  function handleManualEntry(photo: File) {
    setFormKey((k) => k + 1);
    setStage({ kind: "form", key: formKey, photo });
  }

  async function handleSubmit(input: Parameters<typeof addCard>[0]) {
    await addCard(input);
    setStage({ kind: "scan" });
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Card Binder</h1>
        <p className="app__count">{cards.length} card{cards.length === 1 ? "" : "s"}</p>
      </header>

      {stage.kind === "scan" ? (
        <ScanCard onConfirmed={handleConfirmed} onManualEntry={handleManualEntry} />
      ) : (
        <UploadForm
          key={stage.key}
          initialImage={stage.photo}
          initialValues={stage.prefill}
          identifyCandidates={stage.candidates}
          onSubmit={handleSubmit}
          onCancel={() => setStage({ kind: "scan" })}
        />
      )}

      {loading && <p className="app__status">Loading…</p>}
      {error && <p className="gallery-empty">Couldn't load your cards: {error}</p>}
      {!loading && !error && <CardGallery cards={cards} onDelete={removeCard} />}
    </div>
  );
}

export default App;
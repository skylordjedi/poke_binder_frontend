export interface IdentifyMatch {
    id: string;
    name: string;
    number: string;
    rarity: string | null;
    set: { name: string; series: string };
    images: { small: string; large: string };
    similarity?: number;
  }
  
  export interface IdentifyResponse {
    rawText: string;
    candidates: string[];
    matches: IdentifyMatch[];
  }
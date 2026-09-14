import { DeckData, MbbsSubject } from '../types';
import { SAMPLE_DECKS } from '../data/sampleDecks';

const STORAGE_KEY = 'ankidroid_mbbs_decks_v2';

export function loadSavedDecks(): DeckData[] {
  if (typeof window === 'undefined') return SAMPLE_DECKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First-time load: populate with high-yield MBBS starter decks
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DECKS));
      return SAMPLE_DECKS;
    }
    const parsed: DeckData[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter out any legacy cellular respiration decks that might have been saved in browser previously
      const cleaned = parsed.filter(
        (d) =>
          !d.title.toLowerCase().includes('cellular respiration') &&
          !d.id.includes('sample-handwritten-biology')
      );
      if (cleaned.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DECKS));
        return SAMPLE_DECKS;
      }
      return cleaned;
    }
    return SAMPLE_DECKS;
  } catch (err) {
    console.warn('Failed to load decks from localStorage, using defaults:', err);
    return SAMPLE_DECKS;
  }
}

export function saveDeckToStorage(deck: DeckData): DeckData[] {
  try {
    const current = loadSavedDecks();
    const existingIndex = current.findIndex((d) => d.id === deck.id);
    const updatedDeck: DeckData = {
      ...deck,
      updatedAt: new Date().toISOString()
    };

    let next: DeckData[];
    if (existingIndex >= 0) {
      next = [...current];
      next[existingIndex] = updatedDeck;
    } else {
      next = [updatedDeck, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.error('Failed to save deck to localStorage:', err);
    return loadSavedDecks();
  }
}

export function deleteDeckFromStorage(deckId: string): DeckData[] {
  try {
    const current = loadSavedDecks();
    const next = current.filter((d) => d.id !== deckId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.error('Failed to delete deck from localStorage:', err);
    return loadSavedDecks();
  }
}

export function updateDeckSubjectInStorage(deckId: string, subject: MbbsSubject): DeckData[] {
  try {
    const current = loadSavedDecks();
    const next = current.map((d) => (d.id === deckId ? { ...d, subject, updatedAt: new Date().toISOString() } : d));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.error('Failed to update deck subject in localStorage:', err);
    return loadSavedDecks();
  }
}

export function duplicateDeckInStorage(deckId: string): DeckData[] {
  try {
    const current = loadSavedDecks();
    const target = current.find((d) => d.id === deckId);
    if (!target) return current;

    const cloned: DeckData = {
      ...target,
      id: `deck-${Date.now()}`,
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const next = [cloned, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    console.error('Failed to duplicate deck in localStorage:', err);
    return loadSavedDecks();
  }
}

export function resetToMbbsDefaults(): DeckData[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DECKS));
    return SAMPLE_DECKS;
  } catch (err) {
    return SAMPLE_DECKS;
  }
}

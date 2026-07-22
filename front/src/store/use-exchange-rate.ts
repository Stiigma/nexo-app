import { create } from 'zustand';
import { api } from '@/common/services/api-client';

// ── Types ───────────────────────────────────────────────────────────────

export interface ExchangeRateRecord {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  apiSource: string;
  notes: string | null;
  fetchedAt: string;
}

interface ExchangeRateState {
  /** The latest fetched exchange rate, or null before first load */
  currentRate: ExchangeRateRecord | null;
  /** Full history (admin) */
  history: ExchangeRateRecord[];
  /** True while fetching */
  loading: boolean;
  /** Human-readable error, or null if ok */
  error: string | null;

  // ── Actions ──────────────────────────────────────────────────────────

  /** Fetch the current rate from GET /exchange-rate/current */
  fetchCurrentRate: (source?: string, target?: string) => Promise<ExchangeRateRecord>;
  /** Fetch rate history from GET /exchange-rate/history */
  fetchHistory: (source?: string, target?: string) => Promise<ExchangeRateRecord[]>;
  /** Override / force refresh via POST /exchange-rate/override */
  overrideRate: (rate: number, notes?: string, source?: string, target?: string) => Promise<ExchangeRateRecord>;
  /** Clear error */
  clearError: () => void;
}

// ── Store ───────────────────────────────────────────────────────────────

export const useExchangeRateStore = create<ExchangeRateState>((set, get) => ({
  currentRate: null,
  history: [],
  loading: false,
  error: null,

  fetchCurrentRate: async (source?: string, target?: string) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (source) params.source = source;
      if (target) params.target = target;
      const data = await api.get<ExchangeRateRecord>('/exchange-rate/current', params);
      set({ currentRate: data, loading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener tipo de cambio';
      set({ error: message, loading: false });
      throw err;
    }
  },

  fetchHistory: async (source?: string, target?: string) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (source) params.source = source;
      if (target) params.target = target;
      const data = await api.get<ExchangeRateRecord[]>('/exchange-rate/history', params);
      set({ history: data, loading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener historial';
      set({ error: message, loading: false });
      throw err;
    }
  },

  overrideRate: async (rate: number, notes?: string, source?: string, target?: string) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (source) params.source = source;
      if (target) params.target = target;
      const body: Record<string, unknown> = { rate };
      if (notes) body.notes = notes;
      const data = await api.post<ExchangeRateRecord>('/exchange-rate/override', body);
      set({ currentRate: data, loading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al sobrescribir tipo de cambio';
      set({ error: message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

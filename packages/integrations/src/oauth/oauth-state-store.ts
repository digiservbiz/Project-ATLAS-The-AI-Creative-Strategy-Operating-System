export interface OAuthState { value: string; provider: string; accountId: string; redirectUri: string; expiresAt: number; }

export interface OAuthStateStore { put(state: OAuthState): Promise<void>; consume(value: string): Promise<OAuthState | null>; }

export class InMemoryOAuthStateStore implements OAuthStateStore {
  private readonly states = new Map<string, OAuthState>();
  async put(state: OAuthState) { this.states.set(state.value, state); }
  async consume(value: string) {
    const state = this.states.get(value);
    this.states.delete(value);
    if (!state || state.expiresAt <= Date.now()) return null;
    return state;
  }
}

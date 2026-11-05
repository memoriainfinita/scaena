/** Undo and redo over immutable states. Gestures (a drag) are one step: wrap them in `group`. */
export class History<T> {
  private past: T[] = [];
  private future: T[] = [];
  private grouping = 0;
  private pending: T | null = null;

  constructor(
    private current: T,
    private readonly limit = 200,
  ) {}

  get state(): T {
    return this.current;
  }
  get canUndo(): boolean {
    return this.past.length > 0;
  }
  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /** Replace the state. Inside a group, only the state before the first change is kept. */
  set(next: T): void {
    if (next === this.current) return;
    if (this.grouping > 0) {
      if (this.pending === null) this.pending = this.current;
    } else {
      this.push(this.current);
    }
    this.current = next;
    this.future = [];
  }

  group<R>(fn: () => R): R {
    this.grouping++;
    try {
      return fn();
    } finally {
      this.grouping--;
      if (this.grouping === 0 && this.pending !== null) {
        this.push(this.pending);
        this.pending = null;
      }
    }
  }

  undo(): boolean {
    const prev = this.past.pop();
    if (prev === undefined) return false;
    this.future.push(this.current);
    this.current = prev;
    return true;
  }

  redo(): boolean {
    const next = this.future.pop();
    if (next === undefined) return false;
    this.past.push(this.current);
    this.current = next;
    return true;
  }

  /** Replace the state without a step: opening another show starts a fresh history. */
  reset(state: T): void {
    this.current = state;
    this.past = [];
    this.future = [];
    this.pending = null;
  }

  private push(state: T): void {
    this.past.push(state);
    if (this.past.length > this.limit) this.past.shift();
  }
}

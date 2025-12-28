function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `err-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface TrackedError {
  id: string;
  message: string;
  at: string;
  stack?: string;
  context?: Record<string, unknown>;
}

type Subscriber = (errors: TrackedError[]) => void;

const subscribers = new Set<Subscriber>();
let errors: TrackedError[] = [];

function notify() {
  for (const fn of subscribers) {
    fn(errors);
  }
}

export function subscribeToErrors(fn: Subscriber) {
  subscribers.add(fn);
  fn(errors);
  return () => subscribers.delete(fn);
}

export function trackError(error: unknown, context?: Record<string, unknown>): TrackedError {
  const timestamp = new Date().toISOString();
  let message = 'Error desconocido';
  let stack: string | undefined;

  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    message = JSON.stringify(error);
  }

  const entry: TrackedError = {
    id: generateId(),
    message,
    stack,
    at: timestamp,
    context,
  };

  errors = [entry, ...errors].slice(0, 50);
  console.error('[capturado]', { message, context, stack });
  notify();
  return entry;
}

export function clearErrors() {
  errors = [];
  notify();
}

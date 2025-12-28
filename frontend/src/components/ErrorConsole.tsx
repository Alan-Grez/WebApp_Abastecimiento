import React from 'react';
import { TrackedError, clearErrors } from '../lib/errorTracking';

interface ErrorConsoleProps {
  errors: TrackedError[];
}

export const ErrorConsole: React.FC<ErrorConsoleProps> = ({ errors }) => {
  if (!errors.length) return null;

  return (
    <div className="error-console">
      <div className="error-console__header">
        <strong>Errores recientes</strong>
        <button onClick={clearErrors}>Limpiar</button>
      </div>
      <ul>
        {errors.map((err) => (
          <li key={err.id}>
            <div className="error-console__message">{err.message}</div>
            <div className="error-console__meta">
              <span>{new Date(err.at).toLocaleString()}</span>
              {err.context && <span>Contexto: {JSON.stringify(err.context)}</span>}
            </div>
            {err.stack && <pre>{err.stack}</pre>}
          </li>
        ))}
      </ul>
    </div>
  );
};

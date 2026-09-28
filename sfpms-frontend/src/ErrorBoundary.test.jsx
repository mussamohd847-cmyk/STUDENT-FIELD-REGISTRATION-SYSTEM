import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

function BrokenComponent() {
  throw new Error('Crash test');
}

describe('ErrorBoundary', () => {
  it('shows a friendly fallback when a child crashes', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/The application ran into a problem/i)).toBeInTheDocument();
  });
});




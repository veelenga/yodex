import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { createElement } from 'react';

// Mock the lazy-loaded MarkdownContent to avoid Suspense issues in tests
vi.mock('../components/MarkdownContent.lazy', () => ({
  default: ({ content, className = '' }) =>
    createElement('div', { className: `markdown-content ${className}` }, content)
}));

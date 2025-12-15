import { lazy, Suspense } from 'react';

// Lazy load the heavy markdown components
const MarkdownContentInternal = lazy(() => import('./MarkdownContent'));

/**
 * Lazy-loaded wrapper for MarkdownContent
 * Reduces initial bundle size by loading markdown rendering on-demand
 */
export default function MarkdownContent(props) {
  return (
    <Suspense fallback={
      <div className="markdown-content animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    }>
      <MarkdownContentInternal {...props} />
    </Suspense>
  );
}

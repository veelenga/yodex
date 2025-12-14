/**
 * Date formatting utilities
 */

/**
 * Formats a timestamp into a human-readable date
 */
export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

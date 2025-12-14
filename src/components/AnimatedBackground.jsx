/**
 * Animated gradient orbs background effect
 * Creates a subtle, floating blob animation behind content
 */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-40 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
    </div>
  );
}

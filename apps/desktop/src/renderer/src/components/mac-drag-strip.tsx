/**
 * Where macOS's hidden title bar was: dragging here moves the window. It sits
 * over the top of whatever holds it, which keeps its own top space.
 */
export function MacDragStrip() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 h-12 [-webkit-app-region:drag]" />
  );
}

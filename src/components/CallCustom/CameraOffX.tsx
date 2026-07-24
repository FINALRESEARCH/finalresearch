export function CameraOffX() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="0" x2="100" y2="100" stroke="var(--foreground)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="var(--foreground)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

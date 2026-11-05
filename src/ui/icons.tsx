// Inline stroke icons, decorative: every button that uses one has its own accessible name.
const common = { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' } as const;

export const Logo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
    <rect x="2" y="3" width="22" height="14" fill="none" stroke="var(--accent)" stroke-width="2" />
    <path d="M2 21h22" stroke="var(--accent)" stroke-width="2" />
    <circle cx="13" cy="10" r="2.5" fill="var(--accent)" />
  </svg>
);

export const IconSelect = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" {...common}>
    <path d="M4 2l10 7-4.5 1 3 5-2 1-3-5-3.5 3z" />
  </svg>
);
export const IconPan = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" {...common}>
    <path d="M9 2v14M2 9h14M9 2l-2 2M9 2l2 2M9 16l-2-2M9 16l2-2M2 9l2-2M2 9l2 2M16 9l-2-2M16 9l-2 2" />
  </svg>
);
export const IconConnect = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" {...common}>
    <path d="M3 14c0-5 5-1 6-5s4-4 6-6" />
    <circle cx="3" cy="14" r="1.6" />
    <circle cx="15" cy="3" r="1.6" />
  </svg>
);
export const IconText = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" {...common}>
    <path d="M3 4V3h12v1M9 3v12M7 15h4" />
  </svg>
);
export const IconMeasure = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" {...common}>
    <rect x="1.5" y="6" width="15" height="6" />
    <path d="M5 6v3M8 6v2M11 6v3M14 6v2" />
  </svg>
);
export const IconBackground = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" {...common}>
    <rect x="3" y="2" width="12" height="14" />
    <path d="M6 6h6M6 9h6M6 12h4" />
  </svg>
);
export const IconUndo = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" {...common}>
    <path d="M6 5L3 8l3 3M3 8h8a4 4 0 0 1 0 8H8" />
  </svg>
);
export const IconRedo = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" {...common}>
    <path d="M12 5l3 3-3 3M15 8H7a4 4 0 0 0 0 8h3" />
  </svg>
);

export const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" {...common}>
    <path d="M1.5 9S4.5 3.5 9 3.5 16.5 9 16.5 9 13.5 14.5 9 14.5 1.5 9 1.5 9z" />
    <circle cx="9" cy="9" r="2.2" />
  </svg>
);
export const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" {...common}>
    <rect x="3.5" y="8" width="11" height="7.5" rx="1" />
    <path d="M6 8V5.5a3 3 0 0 1 6 0V8" />
  </svg>
);

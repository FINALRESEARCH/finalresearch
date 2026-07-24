'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface DeviceGroup {
  label: string;
  devices: MediaDeviceInfo[];
  currentDeviceId?: string;
  onSelect: (deviceId: string) => void;
}

interface ControlButtonWithMenuProps {
  label: string;
  onToggle?: () => void;
  groups: DeviceGroup[];
  className?: string;
}

export function ControlButtonWithMenu({ label, onToggle, groups, className = '' }: ControlButtonWithMenuProps) {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [tapOpen, setTapOpen] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = hoverOpen || tapOpen;
  const handleMainClick = onToggle ?? (() => setTapOpen((o) => !o));

  useEffect(() => {
    if (!tapOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTapOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [tapOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current || !panelRef.current) {
      setOffsetX(0);
      return;
    }
    const margin = 8;
    const containerRect = containerRef.current.getBoundingClientRect();
    const panelWidth = panelRef.current.offsetWidth;

    let offset = 0;
    const rightOverflow = containerRect.left + panelWidth - (window.innerWidth - margin);
    if (rightOverflow > 0) {
      offset -= rightOverflow;
    }
    const leftOverflow = margin - (containerRect.left + offset);
    if (leftOverflow > 0) {
      offset += leftOverflow;
    }
    setOffsetX(offset);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
    >
      <div className="flex border border-foreground">
        <button
          type="button"
          onClick={handleMainClick}
          className="flex-1 whitespace-nowrap px-3 py-2 text-xs text-foreground transition-opacity hover:opacity-70"
        >
          {label}
        </button>
        <button
          type="button"
          onClick={() => setTapOpen((o) => !o)}
          aria-label="Settings"
          className="border-l border-foreground px-2 py-2 text-xs text-foreground transition-opacity hover:opacity-70"
        >
          &#9662;
        </button>
      </div>

      {isOpen && (
        <div ref={panelRef} className="absolute bottom-full z-20 w-56 pb-1" style={{ left: offsetX }}>
          <div className="border border-foreground bg-background p-1">
            {groups.map((group) => (
              <div key={group.label} className="mb-1 last:mb-0">
                <div className="px-2 py-1 text-xs text-foreground opacity-50">{group.label}</div>
                {group.devices.length === 0 && (
                  <div className="px-2 py-1 text-xs text-foreground opacity-50">NO DEVICES FOUND</div>
                )}
                {group.devices.map((device) => (
                  <button
                    key={device.deviceId}
                    type="button"
                    onClick={() => group.onSelect(device.deviceId)}
                    className={`block w-full truncate px-2 py-1 text-left text-xs text-foreground transition-opacity hover:opacity-100 ${
                      device.deviceId === group.currentDeviceId ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    {device.deviceId === group.currentDeviceId ? '> ' : '  '}
                    {device.label || 'UNNAMED DEVICE'}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

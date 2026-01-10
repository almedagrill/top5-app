"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80; // pixels to pull before refresh triggers

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only enable pull-to-refresh when scrolled to top
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && window.scrollY === 0) {
      // Apply resistance to make it feel natural
      const distance = Math.min(diff * 0.5, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold);

      // Trigger refresh
      router.refresh();

      // Wait a moment for the refresh to complete
      await new Promise(resolve => setTimeout(resolve, 800));

      setRefreshing(false);
    }

    setPulling(false);
    setPullDistance(0);
  }, [pulling, pullDistance, refreshing, router]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          height: pullDistance,
          opacity: Math.min(pullDistance / threshold, 1),
        }}
      >
        <div
          className={`w-6 h-6 border-2 rounded-full ${refreshing ? "animate-spin" : ""}`}
          style={{
            borderColor: "var(--warm-light)",
            borderTopColor: "var(--warm)",
            transform: `rotate(${pullDistance * 2}deg)`,
          }}
        />
      </div>

      {children}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

export function useModalFadeIn(delayMs = 120) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, []);
  return visible;
}

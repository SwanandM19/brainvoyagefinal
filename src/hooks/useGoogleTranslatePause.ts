'use client';
import { useLayoutEffect } from 'react';

export function useGoogleTranslatePause() {
  useLayoutEffect(() => {
    const html = document.documentElement;

    // Save current state
    const prevTranslate = html.getAttribute('translate');
    const prevClass = html.className;

    // Block Google Translate from processing any new DOM nodes
    html.setAttribute('translate', 'no');
    html.classList.add('notranslate');

    // Attempt to click GT's internal "Show original" restore button
    try {
      const iframe = document.getElementsByClassName(
        'goog-te-banner-frame'
      )[0] as HTMLIFrameElement | undefined;
      if (iframe) {
        const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (doc) {
          const buttons = doc.getElementsByTagName('button');
          for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].id?.includes('restore')) {
              buttons[i].click();
              break;
            }
          }
        }
      }
    } catch {
      // GT iframe may not exist — safe to ignore
    }

    return () => {
      // Restore on modal unmount
      if (prevTranslate === null) html.removeAttribute('translate');
      else html.setAttribute('translate', prevTranslate);
      html.className = prevClass;
    };
  }, []);
}

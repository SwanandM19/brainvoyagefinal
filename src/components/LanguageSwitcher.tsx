

// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Globe } from "lucide-react"

// const languages = [
//   { code: "en", name: "English" },
//   { code: "hi", name: "Hindi" },
//   { code: "mr", name: "Marathi" },
// ]

// export default function LanguageSelector() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isLoaded, setIsLoaded] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [currentLanguage, setCurrentLanguage] = useState("en")
//   const containerRef = useRef<HTMLDivElement>(null)
//   const hasInitialized = useRef(false)

//   const hideGoogleElements = () => {
//     const googleBanner = document.querySelector('.skiptranslate') as HTMLElement
//     if (googleBanner) {
//       googleBanner.style.display = 'none'
//     }
//     document.body.style.top = '0px'
//     const iframes = document.querySelectorAll('iframe')
//     iframes.forEach(iframe => {
//       if (iframe.src.includes('translate.google') || iframe.classList.contains('goog-te-banner-frame')) {
//         iframe.style.display = 'none'
//       }
//     })
//   }

//   useEffect(() => {
//     if (hasInitialized.current) return
//     hasInitialized.current = true

//     const translateDiv = document.createElement("div")
//     translateDiv.id = "google_translate_element"
//     translateDiv.style.position = "absolute"
//     translateDiv.style.top = "-9999px"
//     translateDiv.style.left = "-9999px"
//     document.body.appendChild(translateDiv)

//     const initGoogleTranslate = () => {
//       try {
//         if (window.google && window.google.translate) {
//           new window.google.translate.TranslateElement(
//             {
//               pageLanguage: "en",
//               includedLanguages: languages.map(lang => lang.code).join(","),
//               layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
//               autoDisplay: false,
//             },
//             "google_translate_element"
//           )
//           setTimeout(hideGoogleElements, 100)
//           setIsLoaded(true)
//         }
//       } catch (error) {
//         console.error("Failed to initialize Google Translate:", error)
//         setError("Failed to initialize translation")
//         setIsLoaded(true)
//       }
//     }

//     window.googleTranslateElementInit = initGoogleTranslate

//     const script = document.createElement("script")
//     script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
//     script.async = true
//     script.defer = true
//     script.onerror = () => {
//       setError("Failed to load translation service")
//       setIsLoaded(true)
//     }
//     document.body.appendChild(script)

//     const checkInterval = setInterval(() => {
//       const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement
//       if (combo) {
//         clearInterval(checkInterval)
//         setIsLoaded(true)
//         hideGoogleElements()
//       }
//     }, 1000)

//     const style = document.createElement('style')
//     style.textContent = `
//       .goog-te-banner-frame { display: none !important; }
//       .goog-te-menu-value:hover { text-decoration: none !important; }
//       .skiptranslate { display: none !important; }
//       body { top: 0 !important; }
//     `
//     document.head.appendChild(style)

//     const observer = new MutationObserver(() => {
//       hideGoogleElements()
//     })
//     observer.observe(document.body, { childList: true, subtree: true })

//     return () => {
//       clearInterval(checkInterval)
//       observer.disconnect()
//       if (translateDiv && document.body.contains(translateDiv)) document.body.removeChild(translateDiv)
//       if (script && document.body.contains(script)) document.body.removeChild(script)
//       if (style && document.head.contains(style)) document.head.removeChild(style)
//       if ((window as any).googleTranslateElementInit) {
//         (window as any).googleTranslateElementInit = undefined
//       }
//     }
//   }, [])

//   const changeLanguage = (languageCode: string) => {
//     if (!isLoaded) return
//     try {
//       const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement
//       if (combo) {
//         combo.value = languageCode
//         combo.dispatchEvent(new Event("change"))
//         setCurrentLanguage(languageCode)
//         setTimeout(hideGoogleElements, 300)
//       } else {
//         document.cookie = `googtrans=/en/${languageCode}; path=/; domain=${window.location.hostname}`
//         const hostnameParts = window.location.hostname.split('.')
//         if (hostnameParts.length > 1) {
//           const mainDomain = hostnameParts.slice(hostnameParts.length - 2).join('.')
//           document.cookie = `googtrans=/en/${languageCode}; path=/; domain=.${mainDomain}`
//         }
//         window.location.reload()
//       }
//       setIsOpen(false)
//     } catch (err) {
//       console.error("Error changing language:", err)
//       setError("Failed to change language. Please try again.")
//     }
//   }

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
//         setIsOpen(false)
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside)
//     return () => document.removeEventListener("mousedown", handleClickOutside)
//   }, [])

//   return (
//     <div className="fixed bottom-4 left-4 z-50" ref={containerRef}>
//       {isOpen && (
//         <div className="absolute bottom-full mb-2 left-0 w-48 max-h-60 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
//           {!isLoaded && (
//             <p className="text-center py-2 text-sm text-gray-700">Loading languages...</p>
//           )}
//           {error && (
//             <p className="text-center py-2 text-sm text-red-500">{error}</p>
//           )}
//           {isLoaded && !error && languages.map((lang) => (
//             <button
//               key={lang.code}
//               onClick={() => changeLanguage(lang.code)}
//               className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${currentLanguage === lang.code ? "font-medium bg-gray-50" : ""
//                 }`}
//             >
//               {lang.name}
//             </button>
//           ))}
//         </div>
//       )}

//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
//         aria-label="Change language"
//       >
//         <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
//       </button>

//       <div id="google_translate_element" className="hidden" />
//     </div>
//   )
// }

// declare global {
//   interface Window {
//     googleTranslateElementInit: () => void
//     google: any
//   }
// }
"use client"

import { useState, useEffect, useRef } from "react"
import { Globe } from "lucide-react"

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
]

// ─── Cookie Helpers ────────────────────────────────────────────────────────────

function getCurrentLangFromCookie(): string {
  if (typeof document === "undefined") return "en"
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/)
  if (!match) return "en"
  const parts = decodeURIComponent(match[1]).split("/")
  // cookie format: /en/hi  →  parts = ["", "en", "hi"]
  const lang = parts[parts.length - 1]
  return lang && lang !== "en" ? lang : "en"
}

function setGoogTransCookie(targetLang: string) {
  const value = `/en/${targetLang}`
  const hostname = window.location.hostname

  // Always set on root path without domain (catches localhost + simple domains)
  document.cookie = `googtrans=${value}; path=/`
  // Set explicitly for the current hostname
  document.cookie = `googtrans=${value}; path=/; domain=${hostname}`
  // Set for the parent/apex domain so subdomains pick it up too
  const parts = hostname.split(".")
  if (parts.length > 2) {
    const apex = "." + parts.slice(-2).join(".")
    document.cookie = `googtrans=${value}; path=/; domain=${apex}`
  }
}

function removeGoogTransCookie() {
  const expired = "; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  const hostname = window.location.hostname

  document.cookie = `googtrans=; path=/${expired}`
  document.cookie = `googtrans=; path=/; domain=${hostname}${expired}`
  const parts = hostname.split(".")
  if (parts.length > 2) {
    const apex = "." + parts.slice(-2).join(".")
    document.cookie = `googtrans=; path=/; domain=${apex}${expired}`
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Initialise from cookie so the button reflects the real state on every page load
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // ── Read current language from cookie on mount ──────────────────────────────
  useEffect(() => {
    setCurrentLanguage(getCurrentLangFromCookie())
  }, [])

  // ── Suppress Google Translate's own UI chrome ───────────────────────────────
  const hideGoogleElements = () => {
    const banner = document.querySelector(".skiptranslate") as HTMLElement | null
    if (banner) banner.style.display = "none"
    document.body.style.top = "0px"
    document.querySelectorAll<HTMLIFrameElement>("iframe").forEach((f) => {
      if (
        f.src.includes("translate.google") ||
        f.classList.contains("goog-te-banner-frame")
      ) {
        f.style.display = "none"
      }
    })
  }

  // ── Bootstrap Google Translate widget (hidden) ──────────────────────────────
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Hidden container required by the widget
    const translateDiv = document.createElement("div")
    translateDiv.id = "google_translate_element"
    translateDiv.style.cssText = "position:absolute;top:-9999px;left:-9999px"
    document.body.appendChild(translateDiv)

    // Suppress Google's banner & body-shift styles
    const style = document.createElement("style")
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      .skiptranslate        { display: none !important; }
      body                  { top: 0 !important; }
    `
    document.head.appendChild(style)

    // Continuously hide any newly injected Google elements
    const observer = new MutationObserver(hideGoogleElements)
    observer.observe(document.body, { childList: true, subtree: true })

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: languages.map((l) => l.code).join(","),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element"
          )
          setTimeout(hideGoogleElements, 100)
          setIsLoaded(true)
        }
      } catch (err) {
        console.error("Google Translate init failed:", err)
        setError("Failed to initialise translation")
        setIsLoaded(true)
      }
    }

    const script = document.createElement("script")
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    script.defer = true
    script.onerror = () => {
      setError("Failed to load translation service")
      setIsLoaded(true)
    }
    document.body.appendChild(script)

    // Fallback: mark as loaded once the combo appears (even if init callback is slow)
    const poll = setInterval(() => {
      if (document.querySelector(".goog-te-combo")) {
        clearInterval(poll)
        hideGoogleElements()
        setIsLoaded(true)
      }
    }, 800)

    return () => {
      clearInterval(poll)
      observer.disconnect()
      if (document.body.contains(translateDiv)) document.body.removeChild(translateDiv)
      if (document.body.contains(script)) document.body.removeChild(script)
      if (document.head.contains(style)) document.head.removeChild(style)
      delete (window as any).googleTranslateElementInit
    }
  }, [])

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Language switch ─────────────────────────────────────────────────────────
  // FIX: always use cookie + reload.
  // Manipulating .goog-te-combo directly is unreliable in production because
  // Google Translate re-reads its state from the googtrans cookie on every page
  // load. A reload is the only way to guarantee the new language is applied
  // consistently — especially when switching back to the source language.
  const changeLanguage = (code: string) => {
    if (code === currentLanguage) {
      setIsOpen(false)
      return
    }

    setIsOpen(false)
    setCurrentLanguage(code) // optimistic update so button feels instant

    if (code === "en") {
      // Switching back to source language → delete cookie entirely.
      // Setting it to /en/en is NOT reliable; deletion forces Google Translate
      // to treat the page as untranslated.
      removeGoogTransCookie()
    } else {
      setGoogTransCookie(code)
    }

    window.location.reload()
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const currentLangName =
    languages.find((l) => l.code === currentLanguage)?.name ?? "Language"

  return (
    <div className="fixed bottom-4 left-4 z-50" ref={containerRef}>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-48 max-h-60 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {!isLoaded && !error && (
            <p className="text-center py-2 text-sm text-gray-500">
              Loading languages…
            </p>
          )}
          {error && (
            <p className="text-center py-2 text-sm text-red-500">{error}</p>
          )}
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                currentLanguage === lang.code
                  ? "font-semibold bg-gray-50 text-gray-900"
                  : "text-gray-700"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 h-10 sm:h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
        <span className="text-sm font-medium hidden sm:inline">{currentLangName}</span>
      </button>
    </div>
  )
}

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}
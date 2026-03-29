"use client"

import { useState, useEffect, useRef } from "react"
import { Globe } from "lucide-react"

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
]

// ✅ Shared util — clears googtrans cookie on both domain and .domain
function clearGoogTransCookie() {
  const hostname = window.location.hostname
  document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${hostname}`
  const parts = hostname.split(".")
  if (parts.length > 1) {
    const mainDomain = parts.slice(-2).join(".")
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${mainDomain}`
  }
}

function setGoogTransCookie(langCode: string) {
  const hostname = window.location.hostname
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${hostname}`
  const parts = hostname.split(".")
  if (parts.length > 1) {
    const mainDomain = parts.slice(-2).join(".")
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${mainDomain}`
  }
}

function hideGoogleElements() {
  const googleBanner = document.querySelector(".skiptranslate") as HTMLElement
  if (googleBanner) googleBanner.style.display = "none"
  document.body.style.top = "0px"
  document.querySelectorAll("iframe").forEach((iframe) => {
    if (
      iframe.src.includes("translate.google") ||
      iframe.classList.contains("goog-te-banner-frame")
    ) {
      iframe.style.display = "none"
    }
  })
}

export default function FloatingLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const translateDiv = document.createElement("div")
    translateDiv.id = "google_translate_element"
    translateDiv.style.position = "absolute"
    translateDiv.style.top = "-9999px"
    translateDiv.style.left = "-9999px"
    document.body.appendChild(translateDiv)

    const initGoogleTranslate = () => {
      try {
        if (window.google && window.google.translate) {
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
        console.error("Failed to initialize Google Translate:", err)
        setError("Failed to initialize translation")
        setIsLoaded(true)
      }
    }

    window.googleTranslateElementInit = initGoogleTranslate

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

    const checkInterval = setInterval(() => {
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement
      if (combo) {
        clearInterval(checkInterval)
        setIsLoaded(true)
        hideGoogleElements()
      }
    }, 1000)

    const style = document.createElement("style")
    style.id = "goog-hide-style"
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      .goog-te-menu-value:hover { text-decoration: none !important; }
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
    `
    document.head.appendChild(style)

    const observer = new MutationObserver(() => hideGoogleElements())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearInterval(checkInterval)
      observer.disconnect()
      if (translateDiv && document.body.contains(translateDiv))
        document.body.removeChild(translateDiv)
      if (script && document.body.contains(script))
        document.body.removeChild(script)
      const existingStyle = document.getElementById("goog-hide-style")
      if (existingStyle) document.head.removeChild(existingStyle)
      ;(window as any).googleTranslateElementInit = undefined
    }
  }, [])

  const changeLanguage = (langCode: string) => {
    if (!isLoaded) return
    try {
      // ✅ THE FIX: switching TO English must clear cookie and hard reload
      // The combo box approach silently fails on Vercel due to cookie persistence
      if (langCode === "en") {
        clearGoogTransCookie()
        window.location.reload()
        return
      }

      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement
      if (combo) {
        combo.value = langCode
        combo.dispatchEvent(new Event("change"))
        setCurrentLanguage(langCode)
        setTimeout(hideGoogleElements, 300)
      } else {
        // ✅ Fallback: set cookie properly on both domain variants then reload
        setGoogTransCookie(langCode)
        window.location.reload()
      }
      setIsOpen(false)
    } catch (err) {
      console.error("Error changing language:", err)
      setError("Failed to change language. Please try again.")
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-50" ref={containerRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-48 max-h-60 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {!isLoaded && (
            <p className="text-center py-2 text-sm text-gray-700">Loading languages...</p>
          )}
          {error && (
            <p className="text-center py-2 text-sm text-red-500">{error}</p>
          )}
          {isLoaded && !error &&
            languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                  currentLanguage === lang.code ? "font-medium bg-gray-50" : ""
                }`}
              >
                {lang.name}
              </button>
            ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
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
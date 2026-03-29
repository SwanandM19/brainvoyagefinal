"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, ChevronDown } from "lucide-react"

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
]

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
  const banner = document.querySelector(".skiptranslate") as HTMLElement
  if (banner) banner.style.display = "none"
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

export default function FeedLanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  
  // ✅ Separate refs: button for position calc, container for outside-click
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // ✅ Fixed position coords for the dropdown
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  // Recalculate position whenever dropdown opens
  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,   // 8px gap below button
        left: rect.left,
      })
    }
    setIsOpen(true)
  }

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const translateDiv = document.createElement("div")
    translateDiv.id = "google_translate_element_feed"
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
            "google_translate_element_feed"
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
    style.id = "goog-hide-style-feed"
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
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
      const existingStyle = document.getElementById("goog-hide-style-feed")
      if (existingStyle) document.head.removeChild(existingStyle)
      ;(window as any).googleTranslateElementInit = undefined
    }
  }, [])

  const changeLanguage = (langCode: string) => {
    if (!isLoaded) return
    try {
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
        setGoogTransCookie(langCode)
        window.location.reload()
      }
      setIsOpen(false)
    } catch (err) {
      console.error("Error changing language:", err)
      setError("Failed to change language.")
    }
  }

  // ✅ Outside click — checks both button and the fixed dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const clickedButton = buttonRef.current?.contains(target)
      const clickedDropdown = dropdownRef.current?.contains(target)
      if (!clickedButton && !clickedDropdown) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ✅ Close on scroll (position would drift otherwise)
  useEffect(() => {
    if (!isOpen) return
    const handleScroll = () => setIsOpen(false)
    window.addEventListener("scroll", handleScroll, true)
    return () => window.removeEventListener("scroll", handleScroll, true)
  }, [isOpen])

  const currentName = languages.find((l) => l.code === currentLanguage)?.name ?? "English"

  return (
    <>
      {/* Trigger button — inline in filter bar */}
      <button
        ref={buttonRef}
        id="tour-language"
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all flex-shrink-0
          ${isOpen || currentLanguage !== "en"
            ? "border-[#f97316] bg-orange-50 text-[#f97316]"
            : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-orange-300 hover:bg-orange-50"
          }`}
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* ✅ Dropdown rendered with position:fixed — escapes ALL overflow parents */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 9999,
          }}
          className="w-44 max-h-60 overflow-y-auto rounded-xl shadow-2xl bg-white border border-[#E5E7EB] p-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {!isLoaded && (
            <p className="text-center py-2 text-xs text-gray-500">Loading...</p>
          )}
          {error && (
            <p className="text-center py-2 text-xs text-red-500">{error}</p>
          )}
          {isLoaded && !error &&
            languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors ${
                  currentLanguage === lang.code
                    ? "font-bold text-[#f97316] bg-orange-50"
                    : "text-[#374151] font-medium"
                }`}
              >
                {lang.name}
              </button>
            ))}
        </div>
      )}
    </>
  )
}

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}
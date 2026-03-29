// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Globe } from "lucide-react"

// declare global {
//   interface Window {
//     googleTranslateElementInit: () => void
//     google: any
//   }
// }

// const languages = [
//   { code: "en", name: "English" },
//   { code: "hi", name: "Hindi" },
//   { code: "mr", name: "Marathi" },
//   { code: "gu", name: "Gujarati" },
//   { code: "bn", name: "Bengali" },
//   { code: "ta", name: "Tamil" },
//   { code: "te", name: "Telugu" },
//   { code: "kn", name: "Kannada" },
//   { code: "ml", name: "Malayalam" },
//   { code: "pa", name: "Punjabi" },
// ]

// export default function LanguageSwitcher() {
//   const [isOpen, setIsOpen] = useState(false)
//   const dropdownRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const script = document.createElement("script")
//     script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
//     script.async = true
//     document.body.appendChild(script)

//     window.googleTranslateElementInit = () => {
//       ;new (window as any).google.translate.TranslateElement(
//         { pageLanguage: "en", includedLanguages: languages.map((lang) => lang.code).join(",") },
//         "google_translate_element",
//       )
//     }

//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false)
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside)

//     return () => {
//       document.body.removeChild(script)
//       delete (window as any).googleTranslateElementInit
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [])

//   const changeLanguage = (languageCode: string) => {
//     const select = document.querySelector(".goog-te-combo") as HTMLSelectElement
//     if (select) {
//       select.value = languageCode
//       select.dispatchEvent(new Event("change"))
//     }
//     setIsOpen(false)
//   }

//   return (
//     <div className="fixed bottom-4 left-4 z-50" ref={dropdownRef}>
//       {isOpen && (
//         <div className="absolute bottom-full mb-2 left-0 w-48 max-h-60 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
//           {languages.map((lang) => (
//             <button
//               key={lang.code}
//               onClick={() => changeLanguage(lang.code)}
//               className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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



"use client"

import { useState, useEffect, useRef } from "react"
import { Globe } from "lucide-react"

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
]

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  const hideGoogleElements = () => {
    const googleBanner = document.querySelector('.skiptranslate') as HTMLElement
    if (googleBanner) {
      googleBanner.style.display = 'none'
    }
    document.body.style.top = '0px'
    const iframes = document.querySelectorAll('iframe')
    iframes.forEach(iframe => {
      if (iframe.src.includes('translate.google') || iframe.classList.contains('goog-te-banner-frame')) {
        iframe.style.display = 'none'
      }
    })
  }

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
              includedLanguages: languages.map(lang => lang.code).join(","),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element"
          )
          setTimeout(hideGoogleElements, 100)
          setIsLoaded(true)
        }
      } catch (error) {
        console.error("Failed to initialize Google Translate:", error)
        setError("Failed to initialize translation")
        setIsLoaded(true)
      }
    }

    window.googleTranslateElementInit = initGoogleTranslate

    const script = document.createElement("script")
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
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

    const style = document.createElement('style')
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      .goog-te-menu-value:hover { text-decoration: none !important; }
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
    `
    document.head.appendChild(style)

    const observer = new MutationObserver(() => {
      hideGoogleElements()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearInterval(checkInterval)
      observer.disconnect()
      if (translateDiv && document.body.contains(translateDiv)) document.body.removeChild(translateDiv)
      if (script && document.body.contains(script)) document.body.removeChild(script)
      if (style && document.head.contains(style)) document.head.removeChild(style)
      if ((window as any).googleTranslateElementInit) {
        (window as any).googleTranslateElementInit = undefined
      }
    }
  }, [])

  const changeLanguage = (languageCode: string) => {
    if (!isLoaded) return
    try {
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement
      if (combo) {
        combo.value = languageCode
        combo.dispatchEvent(new Event("change"))
        setCurrentLanguage(languageCode)
        setTimeout(hideGoogleElements, 300)
      } else {
        document.cookie = `googtrans=/en/${languageCode}; path=/; domain=${window.location.hostname}`
        const hostnameParts = window.location.hostname.split('.')
        if (hostnameParts.length > 1) {
          const mainDomain = hostnameParts.slice(hostnameParts.length - 2).join('.')
          document.cookie = `googtrans=/en/${languageCode}; path=/; domain=.${mainDomain}`
        }
        window.location.reload()
      }
      setIsOpen(false)
    } catch (err) {
      console.error("Error changing language:", err)
      setError("Failed to change language. Please try again.")
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
          {isLoaded && !error && languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${currentLanguage === lang.code ? "font-medium bg-gray-50" : ""
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

      <div id="google_translate_element" className="hidden" />
    </div>
  )
}

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}

"use client"
import { useState } from "react"
import { RotateCcw, Play, ChevronDown, ChevronUp } from "lucide-react"

const HELP_VIDEOS = [
  {
    id: 1,
    title: "How to Upload a Video",
    duration: "2:30",
    emoji: "📹",
    description: "Upload your teaching videos step by step.",
    embedUrl: "https://www.youtube.com/embed/dESIGVxSSCE",  // ✅ Added
  },
  {
    id: 2,
    title: "How to Use the Feed",
    duration: "1:45",
    emoji: "📡",
    description: "Discover posts, filter by subject, switch languages.",
    embedUrl: "",
  },
  {
    id: 3,
    title: "Understanding Your Stats",
    duration: "2:00",
    emoji: "📊",
    description: "Views, followers, likes — what each stat means.",
    embedUrl: "",
  },
  {
    id: 4,
    title: "How to Climb the Leaderboard",
    duration: "1:30",
    emoji: "🏆",
    description: "Tips to get more views and rank higher.",
    embedUrl: "",
  },
  {
    id: 5,
    title: "Completing Your Profile",
    duration: "1:20",
    emoji: "⚙️",
    description: "Fill your bio, subjects, and board info.",
    embedUrl: "",
  },
]

const FAQS = [
  {
    q: "How do I switch the language?",
    a: "Click the 'English' button in the filters bar. You can switch to Hindi, Marathi, Gujarati and more.",
  },
  {
    q: "Why are my videos not showing?",
    a: "Videos take a few minutes to process after uploading. Refresh after 2-3 minutes.",
  },
  {
    q: "How does the leaderboard ranking work?",
    a: "Your rank is based on total views, followers, and likes. Upload more quality videos consistently.",
  },
  {
    q: "Can students see all my videos?",
    a: "Yes! All uploaded videos are public on the student feed unless you delete them.",
  },
  {
    q: "How do I get more followers?",
    a: "Upload regularly, complete your profile, and tag videos with the right subjects and class levels.",
  },
]

export default function HelpView({ onReplayTour }: { onReplayTour: () => void }) {
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [tab, setTab] = useState<"videos" | "faq">("videos")

  return (
    <div className="space-y-4">

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-extrabold text-lg">❓ Help & Tutorials</h2>
            <p className="text-white/50 text-xs mt-0.5">Videos, FAQs and platform guide</p>
          </div>
          <button
            onClick={onReplayTour}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-extrabold hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            <RotateCcw size={13} />
            Replay Tour
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#F3F4F6] px-6">
          <button
            onClick={() => setTab("videos")}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              tab === "videos"
                ? "border-[#f97316] text-[#f97316]"
                : "border-transparent text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            📹 Video Tutorials
          </button>
          
        </div>
      </div>

      {/* Videos Tab */}
      {tab === "videos" && (
        <div className="space-y-2">
          {HELP_VIDEOS.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              {/* Row */}
              <button
                onClick={() =>
                  setActiveVideo(activeVideo === video.id ? null : video.id)
                }
                className="w-full flex items-center gap-3 p-4 hover:bg-[#FAFAFA] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg flex-shrink-0">
                  {video.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111827] truncate">
                    {video.title}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">{video.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                    {video.duration}
                  </span>
                  {activeVideo === video.id ? (
                    <ChevronUp size={14} className="text-[#9CA3AF]" />
                  ) : (
                    <Play size={14} className="text-orange-400" fill="#fb923c" />
                  )}
                </div>
              </button>

              {/* Expanded player */}
              {activeVideo === video.id && (
                <div className="px-4 pb-4">
                  {video.embedUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={video.embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex flex-col items-center justify-center gap-2">
                      <Play size={24} className="text-white/40" />
                      <p className="text-white/40 text-xs font-bold">
                        Video coming soon
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAQ Tab */}
      {tab === "faq" && (
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-[#FAFAFA] transition-colors text-left"
              >
                <p className="text-sm font-bold text-[#111827]">{faq.q}</p>
                {openFaq === i ? (
                  <ChevronUp size={14} className="text-[#9CA3AF] flex-shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-[#9CA3AF] flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Minus,
  AlignLeft,
  Save,
} from "lucide-react";
// import { useGoogleTranslatePause } from '@/hooks/useGoogleTranslatePause';

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Accountancy",
  "Business Studies",
  "Environmental Science",
];
const ALL_CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];
const ALL_BOARDS = [
  "CBSE",
  "ICSE",
  "Maharashtra SSC",
  "UP Board",
  "Rajasthan Board",
  "Karnataka Board",
  "Tamil Nadu Board",
  "JEE",
  "NEET",
  "UPSC",
  "Other State Board",
];

interface Props {
  onClose: () => void;
  onSuccess: (post: any) => void;
}

type Step = "writing" | "saving" | "done" | "error";

function ToolbarBtn({
  onClick,
  active = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
        active
          ? "bg-orange-100 text-orange-600"
          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
      }`}
    >
      {children}
    </button>
  );
}

export default function WriteArticleModal({ onClose, onSuccess }: Props) {
  // useGoogleTranslatePause();

  const [step, setStep] = useState<Step>("writing");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wordCount, setWordCount] = useState(0);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    classes: [] as string[],
    boards: [] as string[],
  });

  const editorRef = useRef<HTMLDivElement>(null);

  function handleEditorInput() {
    const text = editorRef.current?.innerText ?? "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }

  function isActive(cmd: string) {
    return document.queryCommandState(cmd);
  }

  const toolbar = [
    {
      group: [
        { cmd: "bold", icon: <Bold size={13} />, title: "Bold (Ctrl+B)" },
        { cmd: "italic", icon: <Italic size={13} />, title: "Italic (Ctrl+I)" },
        {
          cmd: "underline",
          icon: <Underline size={13} />,
          title: "Underline (Ctrl+U)",
        },
      ],
    },
    {
      group: [
        {
          cmd: "formatBlock",
          val: "H2",
          icon: <Heading2 size={13} />,
          title: "Heading 2",
        },
        {
          cmd: "formatBlock",
          val: "H3",
          icon: <Heading3 size={13} />,
          title: "Heading 3",
        },
        {
          cmd: "formatBlock",
          val: "P",
          icon: <AlignLeft size={13} />,
          title: "Paragraph",
        },
      ],
    },
    {
      group: [
        {
          cmd: "insertUnorderedList",
          icon: <List size={13} />,
          title: "Bullet list",
        },
        {
          cmd: "insertOrderedList",
          icon: <ListOrdered size={13} />,
          title: "Numbered list",
        },
        {
          cmd: "formatBlock",
          val: "BLOCKQUOTE",
          icon: <Quote size={13} />,
          title: "Blockquote",
        },
      ],
    },
    {
      group: [
        {
          cmd: "insertHorizontalRule",
          icon: <Minus size={13} />,
          title: "Divider",
        },
      ],
    },
  ];

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    const text = editorRef.current?.innerText?.trim() ?? "";
    if (!text || text.length < 50)
      e.body = "Article body must be at least 50 characters.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const body = editorRef.current?.innerHTML ?? "";

    setStep("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/teacher/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          title: form.title.trim(),
          body,
          subject: form.subject,
          classes: form.classes,
          boards: form.boards,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to publish article.");
        setStep("error");
        return;
      }

      onSuccess({
        id: data.postId,
        type: "article",
        title: form.title.trim(),
        body,
        subject: form.subject,
        classes: form.classes,
        boards: form.boards,
        likesCount: 0,
        views: 0,
        createdAt: new Date().toISOString(),
      });

      setStep("done");
    } catch (err: any) {
      console.error("[WRITE_ARTICLE]", err);
      setErrorMsg(err.message ?? "Failed to publish. Please try again.");
      setStep("error");
    }
  }

  function toggleMulti(key: "classes" | "boards", value: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));
  }

  // ── Saving screen ────────────────────────────────────
  // ✅ FIX: removed translate="no" from root div so GT can translate
  if (step === "saving") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Loader2 size={32} className="text-orange-400 animate-spin" />
          </div>
          <p className="font-extrabold text-[#111827] text-base">
            Publishing Article...
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">Saving to database</p>
        </div>
      </div>
    );
  }

  // ── Done screen ──────────────────────────────────────
  if (step === "done") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <p className="font-extrabold text-[#111827] text-lg">
            Article Published! 🎉
          </p>
          <p className="text-sm text-[#6B7280] mt-2 max-w-xs mx-auto">
            Your article is live and visible to students across the platform.
          </p>
          <button
            onClick={onClose}
            className="btn-primary w-full py-3 rounded-xl mt-5"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Error screen ─────────────────────────────────────
  if (step === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <p className="font-extrabold text-[#111827] text-lg">
            Publish Failed
          </p>
          <p className="text-sm text-red-500 mt-2 font-semibold">{errorMsg}</p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-[#E5E7EB] text-[#6B7280] font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setStep("writing");
                setErrorMsg("");
              }}
              className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Writing form ─────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#111827]">
                Write an Article
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Share your knowledge with students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({ ...f, title: e.target.value }));
                  setErrors((p) => ({ ...p, title: "" }));
                }}
                placeholder="e.g. 5 Common Mistakes Students Make in Trigonometry"
                maxLength={300}
                className={`input-base text-base font-semibold ${errors.title ? "border-red-400" : ""}`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Rich text editor */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">
                Article Body <span className="text-red-500">*</span>
                <span className="text-[#6B7280] font-normal ml-1">
                  (min 50 characters)
                </span>
              </label>
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 flex-wrap border border-[#E5E7EB] border-b-0 rounded-t-xl px-2 py-1.5 bg-[#F8F9FA]">
                {toolbar.map((group, gi) => (
                  <div key={gi} className="flex items-center gap-0.5">
                    {gi > 0 && <div className="w-px h-5 bg-[#E5E7EB] mx-1" />}
                    {group.group.map((btn, bi) => (
                      <ToolbarBtn
                        key={bi}
                        title={btn.title}
                        active={"val" in btn ? false : isActive(btn.cmd)}
                        onClick={() =>
                          exec(
                            btn.cmd,
                            ("val" in btn ? btn.val : undefined) as string,
                          )
                        }
                      >
                        {btn.icon}
                      </ToolbarBtn>
                    ))}
                  </div>
                ))}
              </div>
              {/* ✅ contentEditable keeps translate="no" — user writes their own content here */}
             
              <div className="relative">
                {/* Real DOM placeholder — GT can translate this */}
                {wordCount === 0 && (
                  <p className="absolute top-3 left-4 right-4 text-sm text-[#9CA3AF] pointer-events-none select-none z-10">
                    Start writing your article here... Share concepts, tips,
                    tricks, or study notes that will help students.
                  </p>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  translate="no"
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onFocus={() => setErrors((p) => ({ ...p, body: "" }))}
                  className={`min-h-[240px] max-h-[320px] overflow-y-auto border rounded-b-xl px-4 py-3 text-sm text-[#111827] outline-none focus:border-orange-400 transition-colors
      [&>h2]:text-lg [&>h2]:font-extrabold [&>h2]:text-[#111827] [&>h2]:mt-4 [&>h2]:mb-2
      [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-[#111827] [&>h3]:mt-3 [&>h3]:mb-1.5
      [&>p]:mb-2 [&>p]:leading-relaxed
      [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>ul>li]:mb-1
      [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2 [&>ol>li]:mb-1
      [&>blockquote]:border-l-4 [&>blockquote]:border-orange-400 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#6B7280] [&>blockquote]:my-3
      [&>hr]:border-[#E5E7EB] [&>hr]:my-4
      ${errors.body ? "border-red-400" : "border-[#E5E7EB]"}`}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                {errors.body ? (
                  <p className="text-red-500 text-xs">{errors.body}</p>
                ) : (
                  <span />
                )}
                <p className="text-[10px] text-[#9CA3AF] text-right">
                  {wordCount} word{wordCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">
                Subject
              </label>
              <select
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                className="input-base"
              >
                <option value="">Select subject (optional)</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Classes */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">
                Classes
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CLASSES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleMulti("classes", c)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      form.classes.includes(c)
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-orange-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Boards */}
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">
                Boards / Exams
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_BOARDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleMulti("boards", b)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      form.boards.includes(b)
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-orange-400"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-xs text-[#6B7280]">
              <p className="font-bold text-orange-500 mb-1">✍️ Writing Tips</p>
              <p>· Use headings (H2, H3) to structure your article</p>
              <p>· Bullet lists work great for formulas and key points</p>
              <p>· Articles go live immediately — no review needed</p>
            </div>
          </div>

          {/* ── Sticky footer ── */}
          <div className="px-6 py-4 border-t border-[#E5E7EB] bg-white flex-shrink-0">
            <button
              type="submit"
              disabled={!form.title.trim() || wordCount < 10}
              className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>Publish Article</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

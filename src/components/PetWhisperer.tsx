import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Volume2, Lock, Share2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const funnyMessages = [
  "Feed me now, human!",
  "I demand belly rubs immediately.",
  "Who needs sleep when you have me?",
  "I just knocked something over. Oops.",
  "Is it treat o'clock yet?",
  "I run this house, you know.",
  "Time for my 17th nap today.",
  "Did you say walkies?",
  "I see you have food. I want it.",
  "Let me in. Let me out. Let me in again.",
];

const celebrityVoices = [
  { name: "Morgan Freeman", id: "morgan", locked: true },
  { name: "Snoop Dogg", id: "snoop", locked: true },
  { name: "Taylor Swift", id: "taylor", locked: true },
  { name: "Default", id: "default", locked: false },
];

function getRandomMessage() {
  return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
}

function getShareUrl(message: string, voice: string) {
  const params = new URLSearchParams({ message, voice });
  return `${window.location.origin}/?${params.toString()}`;
}

type PetWhispererProps = {
  cardRef?: React.RefObject<HTMLDivElement>;
};

export const PetWhisperer: React.FC<PetWhispererProps> = ({ cardRef }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [voice, setVoice] = useState("default");
  const [purchased, setPurchased] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharedMode, setSharedMode] = useState(false);
  const [showTryIt, setShowTryIt] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [focusAnnouncement, setFocusAnnouncement] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Announce when card is focused (for skip link)
  useEffect(() => {
    if (!cardRef?.current) return;
    const handleFocus = () => {
      setFocusAnnouncement("Pet Whisperer section focused");
      setTimeout(() => setFocusAnnouncement(null), 1200);
    };
    const node = cardRef.current;
    node.addEventListener("focus", handleFocus);
    return () => {
      node.removeEventListener("focus", handleFocus);
    };
  }, [cardRef]);

  // Load shared message from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedMessage = params.get("message");
    const sharedVoice = params.get("voice");
    if (sharedMessage) {
      setMessage(sharedMessage);
      setVoice(sharedVoice || "default");
      setShareUrl(getShareUrl(sharedMessage, sharedVoice || "default"));
      setSharedMode(true);
      setTimeout(() => setShowTryIt(true), 200); // fade-in for "Try it" link
    }
  }, []);

  // Remove URL params when leaving shared mode
  useEffect(() => {
    if (!sharedMode && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (!sharedMode) setShowTryIt(false);
  }, [sharedMode]);

  // Handle image upload (reset shared mode)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setMessage(null);
      setShareUrl(null);
      setSharedMode(false);
    };
    reader.readAsDataURL(file);
  };

  // Helper to show toast and update ARIA live region
  const showToast = (msg: string, type: "success" | "error") => {
    setToastMsg(msg);
    if (type === "success") {
      toast.success(msg, { ariaLive: "polite" });
    } else {
      toast.error(msg, { ariaLive: "polite" });
    }
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Mock AI analysis
  const handleAnalyze = () => {
    if (!image) {
      showToast("Please upload a pet photo first!", "error");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const msg = getRandomMessage();
      setMessage(msg);
      setShareUrl(getShareUrl(msg, voice));
      setAnalyzing(false);
      setSharedMode(false);
      showToast("Pet message generated!", "success");
    }, 1200);
  };

  // Play message using TTS
  const handlePlay = () => {
    if (!message) return;
    let utter = new window.SpeechSynthesisUtterance(message);
    // Use a different voice if available (mock for celebrity)
    if (voice !== "default" && (purchased || sharedMode)) {
      utter.rate = 1;
      utter.pitch = 1.2;
    }
    window.speechSynthesis.speak(utter);
  };

  // Handle celebrity voice selection
  const handleVoiceSelect = (v: string, locked: boolean) => {
    if (locked && !purchased && !sharedMode) {
      showToast("This voice is locked! Purchase to unlock celebrity voices.", "error");
      return;
    }
    setVoice(v);
    showToast(
      `Voice set to ${celebrityVoices.find(cv => cv.id === v)?.name || v}`,
      "success"
    );
    // If a message is already generated, update shareUrl
    if (message) {
      setShareUrl(getShareUrl(message, v));
    }
  };

  // Keyboard navigation for voice buttons
  const handleVoiceBtnKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
    locked: boolean
  ) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      let next = idx + 1;
      while (
        next < celebrityVoices.length &&
        (celebrityVoices[next].locked && !purchased && !sharedMode)
      ) {
        next++;
      }
      if (next < celebrityVoices.length) {
        voiceBtnRefs.current[next]?.focus();
      }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      let prev = idx - 1;
      while (
        prev >= 0 &&
        (celebrityVoices[prev].locked && !purchased && !sharedMode)
      ) {
        prev--;
      }
      if (prev >= 0) {
        voiceBtnRefs.current[prev]?.focus();
      }
    } else if ((e.key === "Enter" || e.key === " ") && !(locked && !purchased && !sharedMode)) {
      e.preventDefault();
      handleVoiceSelect(celebrityVoices[idx].id, locked);
    }
  };

  // Mock purchase
  const handlePurchase = () => {
    setPurchased(true);
    showToast("Celebrity voices unlocked! Try them out.", "success");
  };

  // Share
  const handleShare = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      showToast("Shareable link copied to clipboard!", "success");
    }
  };

  return (
    <Card
      id="pet-whisperer-card"
      role="region"
      aria-label="Pet Whisperer: Upload a pet photo and get a funny AI-generated message in a celebrity voice."
      className="max-w-md w-full mx-auto mt-8 shadow-lg animate-fade-in-card card-interactive focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
      tabIndex={-1}
      ref={cardRef}
    >
      <span className="sr-only" role="heading" aria-level={1}>
        Pet Whisperer: Upload a pet photo and get a funny AI-generated message in a celebrity voice.
      </span>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="pet-whisperer-toast-region"
      >
        {toastMsg}
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="pet-whisperer-focus-announcement"
      >
        {focusAnnouncement}
      </div>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          🐾 Pet Whisperer
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Upload a dog or cat photo, let AI “read” their mind, and get a funny voice message!
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <Input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleImageChange}
            disabled={analyzing || sharedMode}
            aria-label="Upload a pet photo"
            className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
          {image && !sharedMode && (
            <img
              src={image}
              alt="Uploaded pet"
              className="rounded-lg w-full h-48 object-cover border border-gray-300 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary animate-fade-in transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              tabIndex={0}
            />
          )}
          <Button
            onClick={handleAnalyze}
            disabled={!image || analyzing || sharedMode}
            className="w-full flex items-center justify-center py-3 text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Analyze Pet Face"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze Pet Face"
            )}
          </Button>
          <div>
            <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Celebrity voice selection">
              <TooltipProvider>
                {celebrityVoices.map((cv, idx) => {
                  const isLocked = cv.locked && !purchased && !sharedMode;
                  const isSelected = voice === cv.id;
                  const btn = (
                    <Button
                      key={cv.id}
                      ref={el => (voiceBtnRefs.current[idx] = el)}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`flex items-center gap-1 min-w-[110px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-150
                        ${isSelected ? "ring-2 ring-primary ring-offset-2 border-primary bg-primary/90 text-white shadow" : ""}
                        `}
                      onClick={() => handleVoiceSelect(cv.id, cv.locked)}
                      onKeyDown={e => handleVoiceBtnKeyDown(e, idx, isLocked)}
                      disabled={isLocked || sharedMode}
                      aria-label={
                        isLocked
                          ? `${cv.name} (locked)`
                          : cv.name
                      }
                      aria-current={isSelected ? "true" : undefined}
                      tabIndex={0}
                    >
                      {isLocked ? <Lock size={16} aria-hidden /> : null}
                      {cv.name}
                    </Button>
                  );
                  return isLocked ? (
                    <Tooltip key={cv.id}>
                      <TooltipTrigger asChild>
                        {btn}
                      </TooltipTrigger>
                      <TooltipContent>
                        Unlock celebrity voices to use {cv.name}!
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    btn
                  );
                })}
              </TooltipProvider>
            </div>
            {!purchased && !sharedMode && (
              <Button
                variant="secondary"
                className="mt-4 w-full py-3 text-base font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                onClick={handlePurchase}
                aria-label="Unlock Celebrity Voices"
              >
                🔓 Unlock Celebrity Voices ($1.99)
              </Button>
            )}
          </div>
          {message && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div
                className="bg-muted rounded p-3 w-full text-center text-lg font-semibold border border-gray-200 shadow-sm animate-fade-in"
                style={{ animation: "fade-in 0.5s" }}
                aria-live="polite"
              >
                {message}
              </div>
              <Button
                onClick={handlePlay}
                className="flex items-center gap-2 w-full py-3 text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                variant="outline"
                aria-label="Play Voice Message"
              >
                <Volume2 size={18} aria-hidden /> Play Voice Message
              </Button>
              {!sharedMode && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleShare}
                        className="flex items-center gap-2 w-full py-3 text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        variant="ghost"
                        aria-label="Share"
                      >
                        <Share2 size={18} aria-hidden /> Share
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Copy a shareable link to this message
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {shareUrl && (
                <div className="text-xs text-muted-foreground break-all mt-1" aria-label="Shareable link">
                  {shareUrl}
                </div>
              )}
            </div>
          )}
          {sharedMode && (
            <div className="text-xs text-muted-foreground text-center mt-4">
              You are viewing a shared Pet Whisperer message!<br />
              {showTryIt && (
                <button
                  className={`text-blue-600 underline font-medium mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition hover:text-blue-800 fade-in-tryit`}
                  onClick={() => inputRef.current?.click()}
                  tabIndex={showTryIt ? 0 : -1}
                  role="button"
                  aria-label="Try it with your own pet"
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      inputRef.current?.click();
                    }
                  }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  Try it with your own pet!
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <style>
        {`
          @media (max-width: 480px) {
            .max-w-md {
              max-width: 100vw !important;
              margin: 0 !important;
              border-radius: 1rem !important;
              padding-left: 0.5rem !important;
              padding-right: 0.5rem !important;
            }
            .h-48 {
              height: 10rem !important;
            }
            .min-w-[110px] {
              min-width: 90px !important;
            }
          }
          @media (hover: hover) and (pointer: fine) {
            .card-interactive:hover {
              box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10);
              transform: scale(1.015);
              transition: box-shadow 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1);
            }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in {
            animation: fade-in 0.5s;
          }
          @keyframes fade-in-card {
            from { opacity: 0; transform: scale(0.98);}
            to { opacity: 1; transform: scale(1);}
          }
          .animate-fade-in-card {
            animation: fade-in-card 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes fade-in-tryit {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .fade-in-tryit {
            animation: fade-in-tryit 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-fade-in, .animate-fade-in-card, .fade-in-tryit {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
            .card-interactive, .card-interactive:hover {
              transition: none !important;
            }
          }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
            border: 0;
          }
        `}
      </style>
    </Card>
  );
};

export default PetWhisperer;
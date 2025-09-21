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

export const PetWhisperer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [voice, setVoice] = useState("default");
  const [purchased, setPurchased] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharedMode, setSharedMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    }
  }, []);

  // Remove URL params when leaving shared mode
  useEffect(() => {
    if (!sharedMode && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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

  // Mock AI analysis
  const handleAnalyze = () => {
    if (!image) {
      toast.error("Please upload a pet photo first!", { ariaLive: "polite" });
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const msg = getRandomMessage();
      setMessage(msg);
      setShareUrl(getShareUrl(msg, voice));
      setAnalyzing(false);
      setSharedMode(false);
      toast.success("Pet message generated!", { ariaLive: "polite" });
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
      toast.error("This voice is locked! Purchase to unlock celebrity voices.", { ariaLive: "polite" });
      return;
    }
    setVoice(v);
    toast.success(`Voice set to ${celebrityVoices.find(cv => cv.id === v)?.name || v}`, { ariaLive: "polite" });
    // If a message is already generated, update shareUrl
    if (message) {
      setShareUrl(getShareUrl(message, v));
    }
  };

  // Mock purchase
  const handlePurchase = () => {
    setPurchased(true);
    toast.success("Celebrity voices unlocked! Try them out.", { ariaLive: "polite" });
  };

  // Share
  const handleShare = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Shareable link copied to clipboard!", { ariaLive: "polite" });
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto mt-8 shadow-lg animate-fade-in-card">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          🐾 Pet Whisperer
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Upload a dog or cat photo, let AI “read” their mind, and get a funny voice message!
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
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
            <div className="flex flex-wrap gap-2 mt-2">
              <TooltipProvider>
                {celebrityVoices.map((cv) => {
                  const isLocked = cv.locked && !purchased && !sharedMode;
                  const isSelected = voice === cv.id;
                  const btn = (
                    <Button
                      key={cv.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`flex items-center gap-1 min-w-[110px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-150
                        ${isSelected ? "ring-2 ring-primary ring-offset-2 border-primary bg-primary/90 text-white shadow" : ""}
                        `}
                      onClick={() => handleVoiceSelect(cv.id, cv.locked)}
                      disabled={isLocked || sharedMode}
                      aria-label={
                        isLocked
                          ? `${cv.name} (locked)`
                          : cv.name
                      }
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
                className="mt-2 w-full py-3 text-base font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border-2 border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                onClick={handlePurchase}
                aria-label="Unlock Celebrity Voices"
              >
                🔓 Unlock Celebrity Voices ($1.99)
              </Button>
            )}
          </div>
          {message && (
            <div className="mt-4 flex flex-col items-center gap-2">
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
            <div className="text-xs text-muted-foreground text-center mt-2">
              You are viewing a shared Pet Whisperer message!<br />
              <button
                className="text-blue-600 underline font-medium mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition hover:text-blue-800"
                onClick={() => inputRef.current?.click()}
                tabIndex={0}
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
              border-radius: 0 !important;
            }
            .h-48 {
              height: 10rem !important;
            }
            .min-w-[110px] {
              min-width: 90px !important;
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
        `}
      </style>
    </Card>
  );
};

export default PetWhisperer;
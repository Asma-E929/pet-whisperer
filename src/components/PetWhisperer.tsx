import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Volume2, Lock, Share2 } from "lucide-react";

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

  // Handle image upload
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
      toast.error("Please upload a pet photo first!");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const msg = getRandomMessage();
      setMessage(msg);
      setShareUrl(getShareUrl(msg, voice));
      setAnalyzing(false);
      setSharedMode(false);
      toast.success("Pet message generated!");
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
      toast.error("This voice is locked! Purchase to unlock celebrity voices.");
      return;
    }
    setVoice(v);
    toast.success(`Voice set to ${celebrityVoices.find(cv => cv.id === v)?.name || v}`);
    // If a message is already generated, update shareUrl
    if (message) {
      setShareUrl(getShareUrl(message, v));
    }
  };

  // Mock purchase
  const handlePurchase = () => {
    setPurchased(true);
    toast.success("Celebrity voices unlocked! Try them out.");
  };

  // Share
  const handleShare = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Shareable link copied to clipboard!");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8 shadow-lg">
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
          {!sharedMode && (
            <Input
              type="file"
              accept="image/*"
              ref={inputRef}
              onChange={handleImageChange}
              disabled={analyzing}
            />
          )}
          {image && !sharedMode && (
            <img
              src={image}
              alt="Pet"
              className="rounded-lg w-full h-48 object-cover border"
            />
          )}
          {!sharedMode && (
            <Button
              onClick={handleAnalyze}
              disabled={!image || analyzing}
              className="w-full"
            >
              {analyzing ? "Analyzing..." : "Analyze Pet Face"}
            </Button>
          )}
          <div>
            <div className="flex flex-wrap gap-2 mt-2">
              {celebrityVoices.map((cv) => (
                <Button
                  key={cv.id}
                  variant={voice === cv.id ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleVoiceSelect(cv.id, cv.locked)}
                  disabled={cv.locked && !purchased && !sharedMode}
                >
                  {cv.locked && !purchased && !sharedMode ? <Lock size={16} /> : null}
                  {cv.name}
                </Button>
              ))}
            </div>
            {!purchased && !sharedMode && (
              <Button
                variant="secondary"
                className="mt-2 w-full"
                onClick={handlePurchase}
              >
                Unlock Celebrity Voices ($1.99)
              </Button>
            )}
          </div>
          {message && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="bg-muted rounded p-3 w-full text-center text-lg font-semibold">
                {message}
              </div>
              <Button
                onClick={handlePlay}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Volume2 size={18} /> Play Voice Message
              </Button>
              {!sharedMode && (
                <Button
                  onClick={handleShare}
                  className="flex items-center gap-2"
                  variant="ghost"
                >
                  <Share2 size={18} /> Share
                </Button>
              )}
              {shareUrl && (
                <div className="text-xs text-muted-foreground break-all mt-1">
                  {shareUrl}
                </div>
              )}
            </div>
          )}
          {sharedMode && (
            <div className="text-xs text-muted-foreground text-center mt-2">
              You are viewing a shared Pet Whisperer message!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PetWhisperer;
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Send, Bot, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  quickReplies?: string[];
  actionButtons?: { label: string; action: string; path?: string }[];
}

interface BotData {
  name?: string;
  phone_whatsapp?: string;
  exam_track?: string;
  stream_interest?: string;
  state_pref?: string;
  dream_college_ids: string[];
  consent: boolean;
}

export const AIBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);
  const [dataStep, setDataStep] = useState(0);
  const [botData, setBotData] = useState<BotData>({
    dream_college_ids: [],
    consent: false,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Analytics helper
  const trackEvent = (event: string, data?: any) => {
    console.log(`[Analytics] ${event}`, data);
    // Add to events array in user profile if needed
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user?.id) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setBotData({
            name: profile.full_name || undefined,
            phone_whatsapp: profile.phone || undefined,
            exam_track: profile.exam_type || undefined,
            stream_interest: undefined,
            state_pref: profile.native_state || undefined,
            dream_college_ids: profile.dream_college_ids || [],
            consent: profile.whatsapp_optin || false,
          });
        }
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "bot",
          content: "Hey! 👋 I'm your Study Guide AI. Need help with colleges, scholarships, or mock tests?",
          quickReplies: [
            "Find Colleges",
            "See Scholarships",
            "Start Mock Test",
            "Ask a Doubt",
            "Talk to an Advisor"
          ],
        },
      ]);
      trackEvent("bot_opened");
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuickReply = (reply: string) => {
    trackEvent("quick_reply_clicked", { reply });
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: reply },
    ]);

    if (reply === "Find Colleges") {
      setCurrentFlow("colleges");
      trackEvent("intent_detected", { intent: "find_colleges" });
      
      if (!botData.exam_track) {
        setDataStep(1);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "bot",
            content: "Perfect! Let me help you find colleges that fit. First, which exam track are you on?",
            quickReplies: ["JEE", "EAMCET", "NEET", "Degree", "Other"],
          },
        ]);
      } else {
        showCollegeFinderAction();
      }
    } else if (reply === "See Scholarships") {
      trackEvent("intent_detected", { intent: "scholarships" });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "I'll show you scholarships matching your profile!",
          actionButtons: [
            { label: "See eligible scholarships →", action: "navigate", path: "/scholarships" }
          ],
        },
      ]);
    } else if (reply === "Start Mock Test") {
      trackEvent("intent_detected", { intent: "mock_test" });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "Our mock tests are designed by top faculty — free to try, built to match real exams.",
          actionButtons: [
            { label: "Start mock test →", action: "navigate", path: "/mock-tests" }
          ],
        },
      ]);
    } else if (reply === "Ask a Doubt") {
      trackEvent("intent_detected", { intent: "doubt" });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "I'm here to help! Type your question below or explore our tools:",
          actionButtons: [
            { label: "Ask now →", action: "input" }
          ],
        },
      ]);
    } else if (reply === "Talk to an Advisor") {
      setCurrentFlow("advisor");
      trackEvent("intent_detected", { intent: "advisor_request" });
      
      if (!botData.phone_whatsapp) {
        setDataStep(1);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "bot",
            content: "I'll alert our counselor. What's your WhatsApp number?",
          },
        ]);
      } else {
        confirmAdvisorRequest();
      }
    } else {
      handleDataStep(reply);
    }
  };

  const handleDataStep = (value: string) => {
    if (currentFlow === "colleges") {
      if (dataStep === 1) {
        setBotData({ ...botData, exam_track: value });
        setDataStep(2);
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "user", content: value },
          {
            id: (Date.now() + 1).toString(),
            role: "bot",
            content: "Great! Which stream interests you?",
            quickReplies: ["CSE", "ECE", "Mech", "BBA", "Design", "Other"],
          },
        ]);
      } else if (dataStep === 2) {
        setBotData({ ...botData, stream_interest: value });
        setDataStep(3);
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "user", content: value },
          {
            id: (Date.now() + 1).toString(),
            role: "bot",
            content: "Which state do you prefer? (Optional - type or skip)",
          },
        ]);
      }
    }
  };

  const showCollegeFinderAction = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "bot",
        content: "Perfect! I've saved your preferences. Want to start exploring now?",
        actionButtons: [
          { label: "Open College Finder →", action: "navigate", path: "/college-predictor" }
        ],
      },
    ]);
  };

  const confirmAdvisorRequest = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "bot",
        content: "I'll alert our counselor. Expect a call/WhatsApp within 24 hrs.",
      },
    ]);
    trackEvent("advisor_request");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMessage },
    ]);

    // Handle state preference if in data collection flow
    if (currentFlow === "colleges" && dataStep === 3) {
      setBotData({ ...botData, state_pref: userMessage });
      await saveUserData();
      setDataStep(0);
      setCurrentFlow(null);
      showCollegeFinderAction();
      return;
    }

    // Handle phone number for advisor flow
    if (currentFlow === "advisor" && dataStep === 1) {
      setBotData({ ...botData, phone_whatsapp: userMessage });
      await saveUserData();
      setDataStep(0);
      setCurrentFlow(null);
      confirmAdvisorRequest();
      return;
    }

    // General response
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "bot",
        content: "I'm not fully sure. Want a counselor to help?",
        quickReplies: ["Talk to an Advisor", "Find Colleges", "See Scholarships"],
      },
    ]);
  };

  const saveUserData = async () => {
    if (!userId) return;

    try {
      const validExamTypes = ["BITSAT", "COMEDK", "EAMCET", "JEE", "KCET", "NEET", "Other"];
      const examType = botData.exam_track && validExamTypes.includes(botData.exam_track) 
        ? botData.exam_track as "BITSAT" | "COMEDK" | "EAMCET" | "JEE" | "KCET" | "NEET" | "Other"
        : null;

      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: botData.name,
          phone: botData.phone_whatsapp,
          exam_type: examType,
          native_state: botData.state_pref,
          dream_college_ids: botData.dream_college_ids,
          whatsapp_optin: botData.consent,
        })
        .eq("id", userId);

      if (error) throw error;

      trackEvent("lead_complete");
      toast.success("Saved ✅ You can update these anytime.");
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Hmm, that didn't go through. Try again or skip for now.");
    }
  };

  const handleActionButton = (action: string, path?: string) => {
    trackEvent("tile_opened_via_bot", { path });
    
    if (action === "navigate" && path) {
      navigate(path);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Launcher Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Study Guide"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-500 hover:scale-110 transition-all duration-150 z-50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
          size="icon"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Panel - responsive */}
      {isOpen && (
        <Card className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] h-[calc(100vh-2rem)] sm:h-[600px] shadow-2xl z-50 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-purple-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <div className="flex flex-col">
                <span className="text-white font-semibold">Study Guide AI</span>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  {isOnline && (
                    <>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Online
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-white/20 text-white border-0">
                    Updated • just now
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white hover:bg-white/20 focus:ring-2 focus:ring-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl transition-all ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  
                  {msg.quickReplies && (
                    <div className="mt-3 space-y-2">
                      {msg.quickReplies.map((reply) => (
                        <Button
                          key={reply}
                          onClick={() => handleQuickReply(reply)}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left hover:bg-primary/10 transition-all focus:ring-2 focus:ring-primary"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}

                  {msg.actionButtons && (
                    <div className="mt-3 space-y-2">
                      {msg.actionButtons.map((btn, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleActionButton(btn.action, btn.path)}
                          className="w-full justify-between bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-all focus:ring-2 focus:ring-primary"
                          size="sm"
                        >
                          {btn.label}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask anything..."
                aria-label="Message input"
                className="flex-1 focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon"
                aria-label="Send message"
                className="focus:ring-2 focus:ring-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              We'll send helpful updates. Unsubscribe anytime.
            </p>
          </div>
        </Card>
      )}
    </>
  );
};

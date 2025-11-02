"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { askQuestion } from "@/lib/apiService" // <-- 1. IMPORT THE API FUNCTION

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: any[]
}

// ... (interface ChatAssistantProps remains the same)

export default function ChatAssistant({
  activeFile,
  pinnedSnippets,
  chatContext,
  onRemoveSnippet,
}: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your regulatory intelligence assistant. Ask me anything about the documents in the knowledge base.",
      citations: [],
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // --- 2. THIS IS THE MAIN LOGIC CHANGE ---
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input;
    setInput("")
    setLoading(true)

    try {
      // Call the real backend API
      const response = await askQuestion(currentInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        citations: response.citations, // Pass the real citations
      }
      setMessages((prev) => [...prev, assistantMessage])

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I ran into an error. ${error instanceof Error ? error.message : "Please try again."}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // ... (the rest of the component remains the same) ...

  const examplePrompts = [
    "Summarize the impact",
    "What are the requirements?",
    "Which sectors are affected?",
    "Timeline for compliance",
  ]

  return (
    <div className="flex h-full flex-col border-l border-border bg-sidebar">
      {/* Mode Selector */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex gap-2 text-xs">
          <button className="rounded-full bg-primary text-primary-foreground px-3 py-1">Document Chat</button>
          <button className="rounded-full bg-muted text-muted-foreground px-3 py-1">Analysis Summary</button>
          <button className="rounded-full bg-muted text-muted-foreground px-3 py-1">Q & A</button>
        </div>
      </div>

      {/* Pinned Snippets */}
      {pinnedSnippets.length > 0 && (
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Pinned References ({pinnedSnippets.length})
          </p>
          <div className="space-y-2">
            {pinnedSnippets.map((snippet) => (
              <div key={snippet.id} className="rounded-lg bg-background p-2 text-xs">
                <p className="text-foreground italic truncate">{snippet.text}</p>
                <button
                  onClick={() => onRemoveSnippet(snippet)}
                  className="mt-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                  message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                <p>{message.content}</p>
                {/* Updated Citation rendering */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-xs opacity-75">
                    <p className="font-semibold">Sources:</p>
                    {message.citations.map((c, index) => (
                        <p key={index} className="truncate"> - {c.retrievedReferences?.[0]?.location?.s3Location?.uri || 'Unknown'}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start gap-3">
              <div className="bg-muted text-foreground rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-100"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2">Try asking about:</p>
          <div className="grid grid-cols-2 gap-2">
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt)
                }}
                className="text-xs rounded-lg bg-background p-2 text-foreground hover:bg-muted text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-3 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="text-sm"
          />
          <Button size="sm" onClick={handleSendMessage} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between gap-2 text-xs">
          <Button variant="ghost" size="sm" className="h-6 text-xs w-1/2">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-xs w-1/2">
            Export Chat
          </Button>
        </div>
      </div>
    </div>
  )
}
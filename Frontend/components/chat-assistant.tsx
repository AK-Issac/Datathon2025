"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: any[]
}

interface ChatAssistantProps {
  activeFile: any
  pinnedSnippets: any[]
  chatContext: string
  onRemoveSnippet: (snippet: any) => void
}

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
      content: "Hi! I'm your regulatory intelligence assistant. Ask me anything about the documents you've uploaded.",
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

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on the documents, ${input.toLowerCase().includes("impact") ? "the regulatory changes would have significant impact on your portfolio." : "I can provide detailed insights on this matter. The evidence suggests..."}`,
        citations: [{ chunk_id: "chunk-1", page: 2, excerpt: "Key regulatory requirement..." }],
      }
      setMessages((prev) => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

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
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-xs opacity-75">
                    <p>Sources: {message.citations.map((c) => c.chunk_id).join(", ")}</p>
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
            placeholder="Ask about this document..."
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

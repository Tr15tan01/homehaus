"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";

const SUGGESTIONS = [
  "Style a small bedroom under $300",
  "Something smart but not techy-looking for my entryway",
  "Warm up a bare living room",
];

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend(text: string) {
    if (!text.trim()) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-stone bg-surface-raised shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone bg-moss px-4 py-3 text-plaster">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="glow-dot" aria-hidden="true" />
              HomeHaus Assistant
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-plaster/70 hover:text-plaster"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-ink-soft">
                  Tell me about a room and I&apos;ll put together a set from the
                  catalog — decor, smart devices, or both.
                </p>
                <div className="mt-3 space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="block w-full rounded-lg border border-stone px-3 py-2 text-left text-xs text-ink-soft transition hover:border-moss hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "text-right" : ""}>
                <div
                  className={
                    message.role === "user"
                      ? "inline-block max-w-[85%] rounded-2xl rounded-br-sm bg-moss px-3.5 py-2 text-left text-sm text-white"
                      : "inline-block max-w-[90%] rounded-2xl rounded-bl-sm bg-plaster px-3.5 py-2 text-left text-sm text-ink"
                  }
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return <span key={i}>{part.text}</span>;
                    }
                    if (part.type === "tool-searchProducts" || part.type === "tool-buildRoomSet") {
                      const output = "output" in part ? part.output : undefined;
                      const items =
                        (output as { items?: unknown[] } | unknown[] | undefined) &&
                        (Array.isArray(output) ? output : (output as { items?: unknown[] })?.items);
                      if (!items) return null;
                      return (
                        <div key={i} className="mt-2 space-y-1.5">
                          {(items as { slug: string; name: string; price: string }[]).map((p) => (
                            <Link
                              key={p.slug}
                              href={`/products/${p.slug}`}
                              className="block rounded-lg border border-stone bg-surface-raised px-3 py-2 text-xs hover:border-moss"
                            >
                              <span className="font-medium">{p.name}</span>
                              <span className="ml-2 text-ink-soft">{p.price}</span>
                            </Link>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {status === "submitted" && (
              <p className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="glow-dot" aria-hidden="true" />
                Thinking…
              </p>
            )}
            {error && (
              <p className="text-xs text-error">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2 border-t border-stone p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your room…"
              className="flex-1 rounded-full border border-stone bg-plaster px-4 py-2 text-sm outline-none focus:border-moss"
            />
            <button
              type="submit"
              disabled={status === "streaming" || status === "submitted"}
              className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open HomeHaus assistant"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-moss text-white shadow-xl transition hover:bg-moss-dark"
      >
        <span className="glow-dot !h-3 !w-3" aria-hidden="true" />
      </button>
    </>
  );
}

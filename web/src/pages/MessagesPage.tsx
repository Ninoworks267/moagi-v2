import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { PageLoader } from "../components/Skeletons";
import { api } from "../lib/api";
import { timeAgo } from "../lib/format";
import type { Message, Thread, ThreadDetail } from "../lib/types";

export default function MessagesPage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number | null>(
    params.get("to") ? Number(params.get("to")) : null,
  );
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const threadsQuery = useQuery({
    queryKey: ["threads"],
    queryFn: () => api<Thread[]>("/messages/threads"),
    refetchInterval: 30_000,
  });

  const threadQuery = useQuery({
    queryKey: ["thread", selected],
    queryFn: () => api<ThreadDetail>(`/messages/${selected}`),
    enabled: Boolean(selected),
    refetchInterval: 12_000,
  });

  const threads = threadsQuery.data ?? [];
  const thread = threadQuery.data;

  useEffect(() => {
    if (!selected && threads.length > 0) setSelected(threads[0].user.id);
  }, [threads, selected]);

  useEffect(() => {
    if (selected) {
      const next = new URLSearchParams(params);
      next.set("to", String(selected));
      setParams(next, { replace: true });
    }
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  const send = useMutation({
    mutationFn: () =>
      api<Message>(`/messages/${selected}`, { method: "POST", body: { body: draft.trim() } }),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["thread", selected] });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["unread"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !selected) return;
    send.mutate();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  }

  return (
    <div className="container-page pb-12">
      <div className="pb-6 pt-10">
        <p className="eyebrow">Inbox</p>
        <h1 className="mt-1 text-4xl font-semibold">Messages</h1>
        <p className="mt-2 text-sm text-ink/55">Keep every conversation about your home in one safe place.</p>
      </div>

      <div className="grid min-h-[560px] overflow-hidden rounded-3xl border border-ink/10 bg-white lg:grid-cols-[340px_1fr]">
        <div className={`border-r border-ink/8 ${selected && thread ? "hidden lg:block" : "block"}`}>
          <div className="border-b border-ink/8 px-5 py-4">
            <p className="text-sm font-semibold">Conversations</p>
            <p className="text-xs text-ink/40">{threads.length} total</p>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {threadsQuery.isLoading && <div className="p-5"><div className="skeleton h-16 rounded-2xl" /></div>}
            {threads.map((item) => (
              <button
                key={item.user.id}
                onClick={() => setSelected(item.user.id)}
                className={`flex w-full items-center gap-3 border-b border-ink/5 px-4 py-3.5 text-left transition hover:bg-cream ${
                  selected === item.user.id ? "bg-cream" : ""
                }`}
              >
                <Avatar avatarUrl={item.user.avatar_url} first={item.user.first_name} last={item.user.surname} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {item.user.first_name} {item.user.surname}
                    </p>
                    <span className="shrink-0 text-[10px] text-ink/35">{timeAgo(item.last_at)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink/45">{item.last_message}</p>
                </div>
                {item.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-cream">
                    {item.unread}
                  </span>
                )}
              </button>
            ))}
            {!threadsQuery.isLoading && threads.length === 0 && (
              <div className="p-6">
                <EmptyState
                  icon={<MessageSquare size={22} />}
                  title="No conversations yet"
                  description="Message a landlord from any listing to start talking."
                  action={<Link to="/houses" className="btn btn-primary btn-sm">Browse homes</Link>}
                />
              </div>
            )}
          </div>
        </div>

        <div className={`${selected && thread ? "flex" : "hidden lg:flex"} min-h-[420px] flex-col`}>
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-ink/40">
              Select a conversation to start messaging.
            </div>
          ) : threadQuery.isLoading ? (
            <PageLoader />
          ) : thread ? (
            <>
              <div className="flex items-center gap-3 border-b border-ink/8 px-5 py-3.5">
                <button
                  onClick={() => setSelected(null)}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink/50 hover:bg-cream lg:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar avatarUrl={thread.user.avatar_url} first={thread.user.first_name} last={thread.user.surname} size="md" />
                <div className="min-w-0 flex-1">
                  <Link to={`/landlords/${thread.user.id}`} className="truncate text-sm font-semibold hover:text-forest">
                    {thread.user.first_name} {thread.user.surname}
                  </Link>
                  <p className="text-xs capitalize text-ink/40">{thread.user.role} · {thread.user.location}</p>
                </div>
                <Link to={`/landlords/${thread.user.id}`} className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  View profile
                </Link>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-cream/40 p-5" style={{ maxHeight: "60vh" }}>
                {thread.messages.map((msg) => {
                  const mine = msg.sender_id !== thread.user.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          mine
                            ? "rounded-br-md bg-forest text-cream"
                            : "rounded-bl-md border border-ink/8 bg-white text-ink"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-cream/50" : "text-ink/35"}`}>
                          {timeAgo(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {thread.messages.length === 0 && (
                  <p className="py-10 text-center text-sm text-ink/40">Say hello and ask about the home.</p>
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={submit} className="border-t border-ink/8 p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Write a message… (Enter to send)"
                    className="input max-h-32 min-h-11 flex-1 resize-none py-2.5"
                    rows={1}
                    maxLength={2000}
                  />
                  <button type="submit" className="btn btn-primary h-11 shrink-0 px-4" disabled={!draft.trim() || send.isPending}>
                    <Send size={16} />
                  </button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-ink/35">
                  <ShieldCheck size={11} /> Never share bank details or pay before viewing a home.
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-ink/40">
              Could not load this conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

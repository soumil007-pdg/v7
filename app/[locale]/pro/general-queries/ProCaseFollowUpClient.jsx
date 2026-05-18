'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import {
  Scale, ArrowLeft, Send, Loader, MapPin, ChevronRight,
} from 'lucide-react';

const caseTypeColors = {
  contract: '#3B82F6',
  property:  '#10B981',
  family:    '#8B5CF6',
  consumer:  '#F59E0B',
  tort:      '#EF4444',
  other:     '#6B7280',
};

/* ── Markdown rendered in gold/white for dark bg ── */
const DarkMarkdown = ({ children }) => (
  <>
    <style>{`
      .ca-chat-prose p, .ca-chat-prose li {
        font-size: 14px; line-height: 1.75; color: rgba(255,255,255,0.8);
        font-family: 'Inter', sans-serif; margin: 0 0 8px;
      }
      .ca-chat-prose h3 {
        font-size: 13px; font-weight: 700; color: #D4AF37;
        letter-spacing: 0.5px; margin: 16px 0 6px;
        font-family: 'Inter', sans-serif;
      }
      .ca-chat-prose strong { color: #fff; font-weight: 600; }
      .ca-chat-prose a {
        color: #D4AF37; text-decoration: underline;
        text-underline-offset: 3px;
      }
      .ca-chat-prose ul { padding-left: 18px; }
      .ca-chat-prose code {
        background: rgba(212,175,55,0.1); color: #D4AF37;
        padding: 1px 5px; border-radius: 3px; font-size: 12px;
      }
      @keyframes followup-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .followup-spin { animation: followup-spin 0.8s linear infinite; }
      @keyframes followup-fade {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .followup-fade { animation: followup-fade 0.2s ease-out; }
      @keyframes followup-dot {
        0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
        40%            { opacity: 1;   transform: scale(1); }
      }
    `}</style>
    <div className="ca-chat-prose">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  </>
);

export default function ProCaseFollowUpClient() {
  const locale   = useLocale();
  const router   = useRouter();

  const [context,   setContext]   = useState(null);  // case advisor context
  const [messages,  setMessages]  = useState([]);    // visible conversation
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ready,     setReady]     = useState(false);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  /* ── Load context from sessionStorage ─────────── */
  useEffect(() => {
    const raw = sessionStorage.getItem('ca_followup_context');
    if (!raw) {
      // No context — go back to normal general queries
      router.replace(`/${locale}/pro/general-queries`);
      return;
    }
    try {
      const ctx = JSON.parse(raw);
      sessionStorage.removeItem('ca_followup_context');
      setContext(ctx);
    } catch {
      router.replace(`/${locale}/pro/general-queries`);
    }
    setReady(true);
  }, []);

  /* ── Auto-scroll ───────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* ── Auto-resize textarea ──────────────────────── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  /* ── Hidden context injected into every API call ─ */
  const buildContextHistory = (ctx) => [
    {
      role: 'user',
      text: `I need follow-up help on my legal case. Here is the full strategic analysis:\n\nCase Title: "${ctx.caseTitle}"\nCase Type: ${ctx.caseType}\nLocation: ${ctx.city}, ${ctx.state}\n\nFULL ANALYSIS:\n${ctx.result.substring(0, 4000)}`,
    },
    {
      role: 'model',
      text: `I've reviewed the full strategic analysis for your **${ctx.caseTitle}** (${ctx.caseType} matter in ${ctx.city}). I have complete context of your case. What would you like to explore further — the evidence strategy, legal arguments, next steps, or something else?`,
    },
  ];

  /* ── Send message ──────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !context) return;

    const userMsg    = { role: 'user', text: input };
    const newVisible = [...messages, userMsg];
    setMessages(newVisible);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:  input,
          mode:    'deep',
          history: [...buildContextHistory(context), ...messages],
          locale,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...newVisible, { role: 'model', text: data.text }]);
      }
    } catch {
      setMessages([...newVisible, {
        role: 'model',
        text: 'Something went wrong. Please try again.',
      }]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  /* ── Loading / redirect state ──────────────────── */
  if (!ready || !context) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0D1117',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28,
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* Gold ring pulse */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid rgba(212,175,55,0.12)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#D4AF37',
            borderRightColor: 'rgba(212,175,55,0.4)',
            animation: 'fu-ring 1s cubic-bezier(0.4,0,0.2,1) infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 8, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
            animation: 'fu-pulse 2s ease-in-out infinite',
          }} />
          <Scale size={18} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            color: '#D4AF37', opacity: 0.8,
          }} />
        </div>

        {/* Text + dots */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            margin: '0 0 10px', fontSize: 12, fontWeight: 600,
            letterSpacing: 2, color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
          }}>
            Loading Case Context
          </p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#D4AF37',
                animation: `followup-dot 1.4s ease-in-out ${i * 0.22}s infinite`,
              }} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fu-ring {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes fu-pulse {
            0%, 100% { opacity: 0.4; transform: scale(0.9); }
            50%       { opacity: 1;   transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  const typeColor  = caseTypeColors[context.caseType] || '#D4AF37';
  const greetingText = buildContextHistory(context)[1].text;

  /* ── Render ────────────────────────────────────── */
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 57px)',   /* below ProNavbar */
      background: '#0D1117',
      fontFamily: 'Inter, -apple-system, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>

      {/* ── Case Context Banner ─────────────────────── */}
      <div style={{
        background: '#111827',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: 11,
            fontWeight: 600, letterSpacing: 0.5,
            transition: 'color 0.2s', padding: 0, flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          <ArrowLeft size={13} /> Back to Analysis
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

        <Scale size={14} style={{ color: '#D4AF37', flexShrink: 0 }} />

        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {context.caseTitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
            color: typeColor, textTransform: 'uppercase',
          }}>
            {context.caseType}
          </span>
          {context.city && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>·</span>
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <MapPin size={10} /> {context.city}
              </span>
            </>
          )}
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: 1,
            background: 'rgba(212,175,55,0.1)', color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.25)',
            padding: '3px 8px', borderRadius: 4,
          }}>
            FOLLOW-UP MODE
          </span>
        </div>
      </div>

      {/* ── Messages Area ───────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '32px 24px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Seeded AI greeting — always shown */}
          <div className="followup-fade" style={{
            background: '#111827',
            border: '1px solid rgba(212,175,55,0.2)',
            borderLeft: '3px solid #D4AF37',
            borderRadius: '0 8px 8px 0',
            padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Scale size={12} style={{ color: '#D4AF37' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', letterSpacing: 1 }}>
                ADVOCAT CASE AI
              </span>
            </div>
            <DarkMarkdown>{greetingText}</DarkMarkdown>
          </div>

          {/* Conversation */}
          {messages.map((msg, i) => (
            <div key={i} className="followup-fade" style={
              msg.role === 'user'
                ? {
                    alignSelf: 'flex-end',
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '8px 8px 0 8px',
                    padding: '14px 18px',
                    maxWidth: '72%',
                  }
                : {
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: '3px solid rgba(212,175,55,0.4)',
                    borderRadius: '0 8px 8px 0',
                    padding: '18px 20px',
                  }
            }>
              {msg.role === 'user' ? (
                <p style={{
                  margin: 0, fontSize: 14, lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.85)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(212,175,55,0.12)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Scale size={12} style={{ color: '#D4AF37' }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', letterSpacing: 1 }}>
                      ADVOCAT CASE AI
                    </span>
                  </div>
                  <DarkMarkdown>{msg.text}</DarkMarkdown>
                </>
              )}
            </div>
          ))}

          {/* Loading bubble */}
          {isLoading && (
            <div className="followup-fade" style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: '3px solid rgba(212,175,55,0.4)',
              borderRadius: '0 8px 8px 0',
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              {/* Spinning gold ring avatar */}
              <div style={{ position: 'relative', width: 26, height: 26, flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '1.5px solid transparent',
                  borderTopColor: '#D4AF37',
                  borderRightColor: 'rgba(212,175,55,0.35)',
                  animation: 'fu-ring 0.9s linear infinite',
                }} />
                <Scale size={10} style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  color: 'rgba(212,175,55,0.7)',
                }} />
              </div>
              {/* Gold wave dots */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{
                    width: i === 1 || i === 2 ? 7 : 5,
                    height: i === 1 || i === 2 ? 7 : 5,
                    borderRadius: '50%',
                    background: `rgba(212,175,55,${0.25 + i * 0.12})`,
                    animation: `followup-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5, fontWeight: 500 }}>
                Analysing…
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input Area ──────────────────────────────── */}
      <div style={{
        background: '#111827',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
        flexShrink: 0,
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 780, margin: '0 auto',
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: '#0D1625',
            border: '1px solid rgba(212,175,55,0.15)',
            borderRadius: 10, padding: '10px 12px',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
          onBlur={e  => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about evidence strategy, next steps, legal arguments…"
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6,
              resize: 'none', fontFamily: 'Inter, sans-serif',
              maxHeight: 140, minHeight: 24, padding: '2px 0',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: input.trim() && !isLoading
                ? '#D4AF37'
                : 'rgba(212,175,55,0.15)',
              border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <Send size={15} style={{
              color: input.trim() && !isLoading ? '#000' : 'rgba(212,175,55,0.4)',
            }} />
          </button>
        </form>
        <p style={{
          textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)',
          margin: '8px 0 0', letterSpacing: 0.3,
        }}>
          AI has full context of your case analysis · Not a substitute for legal counsel
        </p>
      </div>

    </div>
  );
}

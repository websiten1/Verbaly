'use client'

import { useEffect, useRef, useState } from 'react'

/* ── Design tokens ─────────────────────────────── */
// black: #0A0A0A  lime: #CCFF00  white: #FFFFFF  purple: #7B5CF0

const CSS = `
  /* ── reset + base ──────────────────────────── */
  html, body { background: #FFFFFF; overflow-x: hidden; }
  body {
    margin: 0; padding: 0; color: #0E0E0E;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    -webkit-font-smoothing: antialiased;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: #7B5CF0; color: #FFFFFF; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #7B5CF0; }

  /* ── cursor ────────────────────────────────── */
  @media (pointer: fine) { body.lp { cursor: none; } }
  #lp-cur {
    display: none; position: fixed;
    width: 2px; height: 20px; background: #0E0E0E;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    animation: lp-blink .85s step-end infinite;
  }
  @media (pointer: fine) { #lp-cur { display: block; } }

  /* ── nav ───────────────────────────────────── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 56px; padding: 0 clamp(16px, 4vw, 48px);
    display: flex; align-items: center; justify-content: space-between;
    background: #FFFFFF;
    border-bottom: 1px solid transparent;
    transition: border-color .2s ease;
  }
  .lp-nav.scrolled { border-bottom-color: #E0E0E0; }
  .lp-logo {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 13px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: #0E0E0E; text-decoration: none;
  }
  .lp-navbtn {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400; text-transform: uppercase;
    letter-spacing: .16em; color: #0E0E0E; background: transparent;
    border: 1px solid #0E0E0E; padding: 8px 20px; cursor: pointer;
    transition: background .2s, color .2s;
  }
  .lp-navbtn:hover { background: #0E0E0E; color: #FFFFFF; }

  /* ── hero ──────────────────────────────────── */
  .lp-main {
    background: #FFFFFF;
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    padding: 110px clamp(16px, 4vw, 32px) 80px;
  }

  /* eyebrow */
  .lp-eyebrow {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; font-weight: 400; text-transform: uppercase;
    letter-spacing: .3em; color: rgba(0,0,0,0.35);
    margin-bottom: 32px;
    opacity: 0; animation: lp-fadein .6s ease .1s forwards;
  }

  /* giant title — solid black */
  .lp-title {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(56px, 13vw, 180px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.025em; line-height: .9;
    color: #0E0E0E;
    margin-bottom: 20px; max-width: 100%;
    opacity: 0; animation: lp-fadein .5s ease .05s forwards;
  }
  .lp-title .lp-c {
    display: inline-block; opacity: 0; transform: translateY(-12px);
    transition: opacity .09s ease, transform .09s ease;
  }
  .lp-title .lp-c.in { opacity: 1; transform: translateY(0); }

  /* subtitle */
  .lp-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: clamp(10px, 1.4vw, 13px); font-weight: 400;
    text-transform: uppercase; letter-spacing: .35em;
    color: rgba(0,0,0,0.4); margin-bottom: 20px;
    opacity: 0; transition: opacity .6s ease;
  }
  .lp-sub.in { opacity: 1; }

  /* typewriter cycler — purple */
  .lp-cycler {
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: clamp(11px, 1.4vw, 13px); font-weight: 400;
    text-transform: uppercase; letter-spacing: .14em;
    color: #7B5CF0; min-height: 20px; margin-bottom: 36px;
    opacity: 0; transition: opacity .4s ease;
  }
  .lp-cycler.in { opacity: 1; }
  .lp-vcur {
    display: inline-block; width: 2px; height: 13px;
    background: #7B5CF0; margin-left: 2px; vertical-align: middle;
    animation: lp-blink .7s step-end infinite;
  }

  /* form block */
  .lp-form-block { width: 100%; max-width: 520px; }
  .lp-form-heading {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(22px, 3vw, 30px); font-weight: 700;
    text-transform: uppercase; letter-spacing: -.01em;
    color: #0E0E0E; margin-bottom: 8px;
  }
  .lp-form-rule { height: 1px; background: #7B5CF0; margin-bottom: 8px; }
  .lp-form-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .22em;
    color: rgba(0,0,0,0.4); margin-bottom: 20px;
  }
  .lp-form-row {
    display: flex; border: 1px solid #0E0E0E; margin-bottom: 12px;
    transition: border-color .2s;
  }
  .lp-form-row:focus-within { border-color: #7B5CF0; }
  .lp-input {
    flex: 1; min-width: 0; background: #FFFFFF; border: none;
    padding: 14px 16px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; text-transform: uppercase; letter-spacing: .08em;
    color: #0E0E0E; outline: none;
  }
  .lp-input::placeholder { color: rgba(0,0,0,0.3); }
  .lp-btn {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; font-weight: 500; text-transform: uppercase;
    letter-spacing: .14em; color: #FFFFFF; background: #0E0E0E;
    border: none; border-left: 1px solid #0E0E0E;
    padding: 14px 22px; cursor: pointer; white-space: nowrap;
    transition: background .2s ease;
  }
  .lp-btn:hover:not(:disabled) { background: #7B5CF0; }
  .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .lp-counter {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .2em;
    color: #7B5CF0; text-align: center;
  }

  /* ── demo section ──────────────────────────── */
  .lp-demo {
    background: #FFFFFF;
    padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px);
    display: flex; flex-direction: column; align-items: center;
    border-top: 1px solid #E0E0E0;
  }
  .lp-demo-label {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; text-transform: uppercase; letter-spacing: .3em;
    color: rgba(0,0,0,0.35); margin-bottom: 10px; text-align: center;
  }
  .lp-demo-rule { width: 60px; height: 1px; background: #7B5CF0; margin-bottom: 24px; }

  /* browser chrome */
  .lp-browser { width: 100%; max-width: 860px; border: 1px solid #E0E0E0; }
  .lp-browser-bar {
    background: #F5F5F5; padding: 9px 14px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid #E0E0E0;
  }
  .lp-browser-dots { display: flex; gap: 5px; flex-shrink: 0; }
  .lp-dot { width: 10px; height: 10px; border-radius: 50%; }
  .lp-dot-r { background: #FF5F57; }
  .lp-dot-y { background: #FFBD2E; }
  .lp-dot-g { background: #28C840; }
  .lp-url-bar { flex: 1; min-width: 0; background: #E8E8E8; border-radius: 3px; height: 22px; }
  .lp-browser-body { display: flex; }
  .lp-col { flex: 1; min-width: 0; padding: clamp(16px, 2.5vw, 28px); }
  .lp-col + .lp-col { border-left: 1px solid #E0E0E0; }
  .lp-col-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 8px; }
  .lp-col-hdr-left { display: flex; align-items: center; gap: 6px; }
  .lp-col-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .lp-col-dot-muted { background: rgba(0,0,0,0.2); }
  .lp-col-dot-lime  { background: #7B5CF0; }
  .lp-col-lbl {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .2em;
    color: rgba(0,0,0,0.35);
  }
  .lp-col-lbl-bright { color: #0E0E0E; }
  .lp-match-badge {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .06em;
    color: #FFFFFF; background: #7B5CF0;
    padding: 3px 8px; border-radius: 2px; white-space: nowrap; flex-shrink: 0;
  }
  .lp-col-text-ai {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(11px, 1.4vw, 13px); line-height: 1.75;
    color: rgba(0,0,0,0.2);
  }
  .lp-col-text-you {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(11px, 1.4vw, 13px); line-height: 1.75;
    color: #0E0E0E;
  }

  /* browser col scroll reveal */
  #lp-col-ai  { opacity: 0; transition: opacity .5s ease; }
  #lp-col-ai.in { opacity: 1; }
  #lp-col-you { opacity: 0; transform: translateX(10px); transition: opacity .5s ease .3s, transform .5s ease .3s; }
  #lp-col-you.in { opacity: 1; transform: translateX(0); }

  .lp-demo-caption {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .2em;
    color: #7B5CF0; margin-top: 20px; text-align: center;
  }

  /* ── YOUR VOICE section — black bg only ─────── */
  .lp-voice {
    background: #0A0A0A;
    height: 100vh;
    display: flex; flex-direction: column;
    padding: 0 clamp(16px, 4vw, 48px);
    overflow: hidden;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  /* three lines packed tight */
  .lp-voice-lines {
    flex: 1;
    display: flex; flex-direction: column;
    justify-content: center;
    gap: clamp(6px, 1.5vh, 18px);
  }

  /* font size: fill width, cap by height */
  .lp-voice-line {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(36px, min(10.5vw, 22vh), 152px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.02em; line-height: 1.05;
    white-space: nowrap;
  }

  /* solid fills — no outlines */
  .lp-vl-lime          { color: #CCFF00; }
  .lp-vl-white-outline { color: #FFFFFF; }
  .lp-vl-purple-outline{ color: #7B5CF0; }

  /* scroll reveal — slide from left */
  .lp-vl-lime          { opacity: 0; transform: translateX(-40px); transition: opacity .6s ease, transform .6s ease; }
  .lp-vl-white-outline { opacity: 0; transform: translateX(-40px); transition: opacity .6s ease .15s, transform .6s ease .15s; }
  .lp-vl-purple-outline{ opacity: 0; transform: translateX(-40px); transition: opacity .6s ease .3s, transform .6s ease .3s; }
  .lp-vl-lime.in           { opacity: 1; transform: translateX(0); }
  .lp-vl-white-outline.in  { opacity: 1; transform: translateX(0); }
  .lp-vl-purple-outline.in { opacity: 1; transform: translateX(0); }

  /* bottom bar pinned */
  .lp-voice-bar {
    flex-shrink: 0;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
    padding: 16px 0 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .lp-voice-tag {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .15em;
    color: rgba(255,255,255,0.3);
  }

  /* ── footer — white ─────────────────────────── */
  .lp-footer {
    background: #FFFFFF;
    height: 44px; padding: 0 clamp(16px, 4vw, 48px);
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid #E0E0E0;
  }
  .lp-ft {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .2em;
    color: rgba(0,0,0,0.25);
  }

  /* ── keyframes ─────────────────────────────── */
  @keyframes lp-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  @keyframes lp-fadein { from{opacity:0;} to{opacity:1;} }

  /* ── responsive ────────────────────────────── */
  @media (max-width: 640px) {
    .lp-browser-body { flex-direction: column; }
    .lp-col + .lp-col { border-left: none; border-top: 1px solid #E0E0E0; }
    #lp-col-you { transform: translateX(0); }
    .lp-voice { height: auto; min-height: 100vh; }
    .lp-voice-lines { justify-content: center; }
  }
  @media (max-width: 480px) {
    .lp-form-row { flex-direction: column; }
    .lp-btn { border-left: none; border-top: 1px solid #0E0E0E; padding: 14px; width: 100%; }
  }
`

const PHRASES = [
  "YOUR VOICE. NOT A ROBOT'S.",
  "YOUR WORDS. YOUR STYLE.",
  "AI THAT SOUNDS LIKE YOU.",
]

export default function LandingPage() {
  const navRef    = useRef<HTMLElement>(null)
  const curRef    = useRef<HTMLDivElement>(null)
  const titleRef  = useRef<HTMLHeadingElement>(null)
  const subRef    = useRef<HTMLParagraphElement>(null)
  const cyclerRef = useRef<HTMLDivElement>(null)
  const cyclerTxt = useRef<HTMLSpanElement>(null)
  const emailRef  = useRef<HTMLInputElement>(null)

  const [joinState, setJoinState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [count,     setCount]     = useState(247)

  /* cursor */
  useEffect(() => {
    const cur = curRef.current
    if (!cur || !window.matchMedia('(pointer: fine)').matches) return
    document.body.classList.add('lp')
    const move = (e: MouseEvent) => {
      cur.style.left = e.clientX + 'px'
      cur.style.top  = e.clientY + 'px'
    }
    document.addEventListener('mousemove', move, { passive: true })
    return () => { document.body.classList.remove('lp'); document.removeEventListener('mousemove', move) }
  }, [])

  /* nav border on scroll */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const fn = () => nav.classList.toggle('scrolled', window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* title → subtitle → cycler chain */
  useEffect(() => {
    const title = titleRef.current
    if (!title) return
    title.innerHTML = ''
    ;[...'VERBALY'].forEach((ch, i) => {
      const s = document.createElement('span')
      s.className = 'lp-c'
      s.textContent = ch
      title.appendChild(s)
      setTimeout(() => s.classList.add('in'), 200 + i * 50)
    })
    const afterTitle = 200 + 7 * 50 + 120
    setTimeout(() => {
      subRef.current?.classList.add('in')
      setTimeout(startCycler, 400)
    }, afterTitle)

    function startCycler() {
      const wrap = cyclerRef.current
      const txt  = cyclerTxt.current
      if (!wrap || !txt) return
      wrap.classList.add('in')
      const t = txt
      let pi = 0, ci = 0, del = false, paused = false
      function tick() {
        if (paused) return
        const p = PHRASES[pi]
        if (!del) {
          t.textContent = p.slice(0, ++ci)
          if (ci === p.length) {
            paused = true
            setTimeout(() => { paused = false; del = true; tick() }, 2000)
            return
          }
          setTimeout(tick, 38)
        } else {
          t.textContent = p.slice(0, --ci)
          if (ci === 0) {
            del = false; pi = (pi + 1) % PHRASES.length
            setTimeout(tick, 400); return
          }
          setTimeout(tick, 20)
        }
      }
      setTimeout(tick, 200)
    }
  }, [])

  /* demo browser reveal */
  useEffect(() => {
    const ai  = document.getElementById('lp-col-ai')
    const you = document.getElementById('lp-col-you')
    if (!ai) return
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { ai.classList.add('in'); you?.classList.add('in'); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(ai)
    return () => io.disconnect()
  }, [])

  /* YOUR VOICE section reveal */
  useEffect(() => {
    const lime   = document.getElementById('lp-vl-lime')
    const white  = document.getElementById('lp-vl-white')
    const purple = document.getElementById('lp-vl-purple')
    if (!lime) return
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        lime.classList.add('in')
        white?.classList.add('in')
        purple?.classList.add('in')
        io.disconnect()
      }
    }, { threshold: 0.1 })
    io.observe(lime)
    return () => io.disconnect()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = emailRef.current
    if (!input) return
    const email = input.value.trim()
    if (!email) return
    setJoinState('loading')
    setJoinError(null)
    try {
      const res = await fetch('https://magic.beehiiv.com/v1/5dbf8d69-9f54-4ee0-9658-260b88b823cb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('server')
      setJoinState('success')
      setCount(c => c + 1)
    } catch {
      setJoinState('error')
      setJoinError("Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={curRef} id="lp-cur" aria-hidden="true" />

      {/* ── NAV ─── */}
      <nav ref={navRef} className="lp-nav" role="navigation">
        <a href="/" className="lp-logo">Verbaly</a>
        <button className="lp-navbtn" onClick={() => emailRef.current?.focus()} aria-label="Join the waitlist">
          Join Waitlist
        </button>
      </nav>

      {/* ── HERO ─── */}
      <main className="lp-main" role="main">

        <p className="lp-eyebrow">Pre-Launch &middot; AI Writing Tool</p>

        <h1 ref={titleRef} className="lp-title" aria-label="Verbaly" />

        <p ref={subRef} className="lp-sub">Everything Sounds Like You</p>

        <div ref={cyclerRef} className="lp-cycler" aria-live="polite" aria-atomic="true">
          <span ref={cyclerTxt} />
          <span className="lp-vcur" aria-hidden="true" />
        </div>

        <div className="lp-form-block">
          <p className="lp-form-heading">Join the Waitlist</p>
          <div className="lp-form-rule" aria-hidden="true" />
          <p className="lp-form-sub">Free Pro Access &middot; First 500 People</p>

          {joinState === 'success' ? (
            <div style={{
              border: '1px solid #7B5CF0', padding: '14px 16px', marginBottom: '12px',
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '.12em',
              color: '#7B5CF0',
            }}>
              ✓&nbsp;&nbsp;You&apos;re on the list. Check your email.
            </div>
          ) : (
            <>
              <form className="lp-form-row" onSubmit={handleSubmit} noValidate>
                <input
                  ref={emailRef} className="lp-input" type="email"
                  placeholder="Your email address" autoComplete="email"
                  required aria-label="Email address"
                  disabled={joinState === 'loading'}
                />
                <button
                  className="lp-btn" type="submit"
                  disabled={joinState === 'loading'}
                  style={{ opacity: joinState === 'loading' ? 0.6 : 1, cursor: joinState === 'loading' ? 'not-allowed' : 'pointer' }}
                >
                  {joinState === 'loading' ? '…' : 'Join →'}
                </button>
              </form>
              {joinError && (
                <p style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '.1em',
                  color: '#FF4444', marginBottom: '10px',
                }}>
                  {joinError}
                </p>
              )}
            </>
          )}

          <p className="lp-counter" aria-label={`${count} people already waiting`}>
            &#10022;&nbsp;{count} People Already Waiting
          </p>
        </div>

      </main>

      {/* ── DEMO ─── */}
      <section className="lp-demo" aria-label="See the difference">

        <p className="lp-demo-label">See the Difference</p>
        <div className="lp-demo-rule" aria-hidden="true" />

        <div className="lp-browser" role="img" aria-label="Before and after comparison">
          <div className="lp-browser-bar" aria-hidden="true">
            <div className="lp-browser-dots">
              <span className="lp-dot lp-dot-r" />
              <span className="lp-dot lp-dot-y" />
              <span className="lp-dot lp-dot-g" />
            </div>
            <div className="lp-url-bar" />
          </div>

          <div className="lp-browser-body">
            <div id="lp-col-ai" className="lp-col">
              <div className="lp-col-hdr">
                <div className="lp-col-hdr-left">
                  <span className="lp-col-dot lp-col-dot-muted" aria-hidden="true" />
                  <span className="lp-col-lbl">AI Generated</span>
                </div>
              </div>
              <p className="lp-col-text-ai">
                In today&rsquo;s competitive landscape, leveraging cutting-edge artificial
                intelligence solutions enables organizations to optimize their operational
                efficiency and maximize stakeholder value through data-driven
                decision-making processes.
              </p>
            </div>

            <div id="lp-col-you" className="lp-col">
              <div className="lp-col-hdr">
                <div className="lp-col-hdr-left">
                  <span className="lp-col-dot lp-col-dot-lime" aria-hidden="true" />
                  <span className="lp-col-lbl lp-col-lbl-bright">Your Voice</span>
                </div>
                <span className="lp-match-badge" aria-label="94% match">94% Match</span>
              </div>
              <p className="lp-col-text-you">
                Here&rsquo;s the thing &mdash; most companies are sitting on AI tools and
                still wondering why nothing&rsquo;s getting faster. The data&rsquo;s there.
                The decisions aren&rsquo;t. That gap? That&rsquo;s the problem worth solving.
              </p>
            </div>
          </div>
        </div>

        <p className="lp-demo-caption">
          Your style. Learned in minutes. Applied instantly.
        </p>

      </section>

      {/* ── YOUR VOICE SECTION ─── */}
      <section className="lp-voice" aria-label="Your voice, everywhere">

        <div className="lp-voice-lines">
          <p id="lp-vl-lime"   className="lp-voice-line lp-vl-lime">YOUR VOICE.</p>
          <p id="lp-vl-white"  className="lp-voice-line lp-vl-white-outline" aria-hidden="true">SOUNDS LIKE YOU.</p>
          <p id="lp-vl-purple" className="lp-voice-line lp-vl-purple-outline" aria-hidden="true">EVERY WHERE.</p>
        </div>

        <div className="lp-voice-bar">
          <span className="lp-voice-tag">Trained on your writing. Applied to everything.</span>
          <span className="lp-voice-tag">No credit card ever required</span>
        </div>

      </section>

      {/* ── FOOTER ─── */}
      <footer className="lp-footer" role="contentinfo">
        <span className="lp-ft">&copy; Verbaly 2026</span>
        <span className="lp-ft">Everything Sounds Like You</span>
      </footer>
    </>
  )
}

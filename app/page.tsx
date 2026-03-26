'use client'

import { useEffect, useRef } from 'react'

/* ── Design tokens ─────────────────────────────── */
// black: #0A0A0A  lime: #CCFF00  white: #FFFFFF  purple: #7B5CF0
// green (counter): #00FF87  pink (badge): #FF6B9D

const TW_PHRASES = [
  'TURN AI TEXT INTO YOUR VOICE',
  'AI THAT SOUNDS LIKE YOU',
  'ANALYZING PUNCTUATION PATTERNS...',
  'ANALYZING SENTENCE RHYTHM...',
  'ANALYZING VOCABULARY FINGERPRINT...',
  'OUTPUT: UNMISTAKABLY YOU',
]

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
  .lp-logo img { height: 32px; width: auto; display: block; }
  @media (min-width: 769px) { .lp-logo img { height: 52px; } }
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

  /* ── hero wrapper ───────────────────────────── */
  .lp-main {
    background: #FFFFFF;
    padding-top: 56px; /* clear fixed nav */
  }

  /* ── Section A — identity strip ────────────── */
  .lp-strip-a {
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    padding: 24px clamp(16px, 4vw, 48px) 20px;
    gap: 6px;
  }

  /* PRE-LAUNCH badge — plain text, pink, no fill */
  .lp-badge {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9px; font-weight: 500; text-transform: uppercase;
    letter-spacing: .28em; color: #FF6B9D;
    opacity: 0; animation: lp-fadein .5s ease .05s forwards;
  }

  /* VERBALY heading */
  .lp-verbaly {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(56px, 10vw, 140px);
    font-weight: 700; color: #0E0E0E;
    letter-spacing: -.03em; line-height: 0.95;
    text-transform: uppercase;
    opacity: 0; animation: lp-fadein .5s ease .12s forwards;
  }

  /* typewriter line */
  .lp-tw {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: clamp(10px, 1.15vw, 13px); font-weight: 400;
    text-transform: uppercase; letter-spacing: .18em;
    color: rgba(0,0,0,0.38);
    height: 20px; display: flex; align-items: center;
    opacity: 0; animation: lp-fadein .5s ease .22s forwards;
  }
  .lp-tw-cur {
    display: inline-block; width: 6px; height: 12px;
    background: rgba(0,0,0,0.3); vertical-align: middle;
    margin-left: 2px;
    animation: lp-blink .7s step-end infinite;
  }

  /* ── Section B — waitlist strip ────────────── */
  .lp-strip-b {
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    padding: 20px clamp(16px, 4vw, 48px) 24px;
    gap: 0;
    opacity: 0; animation: lp-fadein .5s ease .3s forwards;
  }
  .lp-form-heading {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(18px, 2.2vw, 24px); font-weight: 700;
    text-transform: uppercase; letter-spacing: -.01em;
    color: #0E0E0E; margin-bottom: 6px;
  }
  .lp-form-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .22em;
    color: rgba(0,0,0,0.4); margin-bottom: 14px;
  }
  .lp-form-block { width: 100%; max-width: 480px; }
  .lp-form-row {
    display: flex; border: 1px solid #0E0E0E; margin-bottom: 10px;
  }
  .lp-input {
    flex: 1; min-width: 0; background: #FFFFFF; border: none;
    padding: 12px 14px;
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
    padding: 12px 22px; cursor: pointer; white-space: nowrap;
    transition: background .2s ease;
  }
  .lp-btn:hover:not(:disabled) { background: #333333; }
  .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .lp-counter {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .2em;
    color: #7B5CF0; text-align: center;
  }

  /* ── mobile sticky waitlist bar ────────────── */
  .lp-sticky-bar {
    display: none;
  }
  @media (max-width: 768px) {
    .lp-sticky-bar {
      display: block;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      border-top: 1px solid #E0E0E0;
    }
    .lp-sticky-btn {
      width: 100%; padding: 16px;
      background: #000000; color: #FFFFFF; border: none;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 11px; font-weight: 500; text-transform: uppercase;
      letter-spacing: .16em; cursor: pointer;
    }
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
    display: flex; flex-direction: column;
    padding: clamp(48px, 7vh, 96px) clamp(40px, 8vw, 120px);
    overflow: hidden;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .lp-voice-lines {
    display: flex; flex-direction: column;
    justify-content: center;
    gap: 0;
  }
  .lp-voice-line {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(33px, min(9.2vw, 19vh), 134px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.02em; line-height: 0.9;
    white-space: nowrap;
  }
  .lp-vl-lime          { color: #CCFF00; }
  .lp-vl-white-outline { color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.15); }
  .lp-vl-purple-outline{ color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.15); }
  .lp-vl-lime          { opacity: 0; transform: translateX(-40px); transition: opacity .6s ease, transform .6s ease; }
  .lp-vl-white-outline { opacity: 0; transform: translateX(-40px); transition: opacity .6s ease .15s, transform .6s ease .15s; }
  .lp-vl-purple-outline{ opacity: 0; transform: translateX(-40px); transition: opacity .6s ease .3s, transform .6s ease .3s; }
  .lp-vl-lime.in           { opacity: 1; transform: translateX(0); }
  .lp-vl-white-outline.in  { opacity: 1; transform: translateX(0); }
  .lp-vl-purple-outline.in { opacity: 1; transform: translateX(0); }
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
    color: #FFFFFF;
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
  @keyframes lp-blink      { 0%,100%{opacity:1;} 50%{opacity:0;} }
  @keyframes lp-fadein     { from{opacity:0;} to{opacity:1;} }
  @keyframes lp-success-in { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
  @keyframes lp-check-pulse{ 0%,100%{transform:scale(1);} 50%{transform:scale(1.25);} }
  @keyframes lp-count-up   { from{opacity:0;transform:translateY(7px);} to{opacity:1;transform:translateY(0);} }

  /* ── responsive ────────────────────────────── */
  @media (max-width: 640px) {
    .lp-browser-body { flex-direction: column; }
    .lp-col + .lp-col { border-left: none; border-top: 1px solid #E0E0E0; }
    #lp-col-you { transform: translateX(0); }
    .lp-voice { padding-left: clamp(20px, 5vw, 60px); padding-right: clamp(20px, 5vw, 60px); }
  }
  @media (max-width: 480px) {
    .lp-form-row { flex-direction: column; }
    .lp-btn { border-left: none; border-top: 1px solid #0E0E0E; padding: 12px; width: 100%; }
  }
`

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null)
  const curRef = useRef<HTMLDivElement>(null)
  const twRef  = useRef<HTMLDivElement>(null)

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

  /* typewriter loop */
  useEffect(() => {
    const el = twRef.current
    if (!el) return
    const txtEl = document.createElement('span')
    const curEl = document.createElement('span')
    curEl.className = 'lp-tw-cur'
    el.appendChild(txtEl)
    el.appendChild(curEl)

    let cancelled = false
    const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms))

    async function run() {
      let idx = 0
      while (!cancelled) {
        const phrase = TW_PHRASES[idx % TW_PHRASES.length]
        idx++
        for (let i = 0; i <= phrase.length; i++) {
          if (cancelled) return
          txtEl.textContent = phrase.slice(0, i)
          await delay(38)
        }
        await delay(1600)
        for (let i = phrase.length; i >= 0; i--) {
          if (cancelled) return
          txtEl.textContent = phrase.slice(0, i)
          await delay(20)
        }
        await delay(320)
      }
    }

    run()
    return () => { cancelled = true }
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={curRef} id="lp-cur" aria-hidden="true" />

      {/* ── NAV ─── */}
      <nav ref={navRef} className="lp-nav" role="navigation">
        <a href="/" className="lp-logo"><img src="/logo.png" alt="Verbaly" /></a>
        <button className="lp-navbtn" onClick={() => document.getElementById('lp-waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} aria-label="Join the waitlist">
          Join Waitlist
        </button>
      </nav>

      {/* ── HERO ─── */}
      <main className="lp-main" role="main">

        {/* Section A — identity strip */}
        <div className="lp-strip-a">
          <span className="lp-badge">Pre-Launch</span>
          <h1 className="lp-verbaly">Verbaly</h1>
          <div ref={twRef} className="lp-tw" aria-live="polite" />
          <p className="lp-form-sub" style={{ marginTop: '18px' }}>Built for students who write with AI.</p>
        </div>

        {/* Section B — waitlist strip */}
        <div className="lp-strip-b">
          <p className="lp-form-heading">Join the Waitlist</p>
          <p className="lp-form-sub">Free Pro Access &middot; First 500 People</p>
          <div id="lp-waitlist" className="lp-form-block">
            <div style={{ overflow: 'hidden', height: '80px', width: '100%', maxWidth: '560px' }}>
              <iframe
                src="https://subscribe-forms.beehiiv.com/3d875e43-6c72-4ed0-af92-0d538ccb2975"
                className="beehiiv-embed"
                data-test-id="beehiiv-embed"
                frameBorder={0}
                scrolling="no"
                style={{ width: '100%', maxWidth: '560px', height: '80px', margin: 0, borderRadius: 0, backgroundColor: 'transparent', boxShadow: 'none' }}
              />
            </div>
            <p className="lp-counter">&#10022;&nbsp;247 People Already Waiting</p>
          </div>
        </div>

      </main>

      {/* ── MOBILE STICKY BAR ─── */}
      <div className="lp-sticky-bar" aria-hidden="true">
        <button
          className="lp-sticky-btn"
          onClick={() => document.getElementById('lp-waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          Join Waitlist →
        </button>
      </div>

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

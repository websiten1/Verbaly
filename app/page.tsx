'use client'

import { useEffect, useRef } from 'react'

const CSS = `
  /* ── tokens ─────────────────────────────── */
  :root {
    --paper:  #F0EDE6;
    --ink:    #0E0E0E;
    --violet: #6B1FFF;
    --gray:   #888880;
  }

  /* ── base ───────────────────────────────── */
  html { scroll-behavior: smooth; overflow-x: hidden; }
  html, body { background: #F0EDE6; }
  body {
    margin: 0; padding: 0; overflow-x: hidden;
    color: #0E0E0E;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    -webkit-font-smoothing: antialiased;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: #6B1FFF; color: #F0EDE6; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #0E0E0E; }

  /* ── cursor ─────────────────────────────── */
  @media (pointer: fine) { body.lp { cursor: none; } }
  #lp-cur {
    display: none;
    position: fixed;
    width: 2px; height: 20px;
    background: #0E0E0E;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: lp-blink .85s step-end infinite;
  }
  @media (pointer: fine) { #lp-cur { display: block; } }

  /* ── grain ──────────────────────────────── */
  #lp-grain {
    position: fixed; inset: 0;
    pointer-events: none; z-index: 800; opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
  }

  /* ── nav ────────────────────────────────── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 200; height: 56px;
    padding: 0 clamp(16px, 4vw, 40px);
    display: flex; align-items: center; justify-content: space-between;
    background: #F0EDE6;
    border-bottom: 1px solid transparent;
    transition: border-color .2s ease;
  }
  .lp-nav.scrolled { border-bottom-color: #0E0E0E; }

  .lp-logo {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    color: #0E0E0E; text-decoration: none;
  }
  .lp-navbtn {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .16em;
    color: #0E0E0E; background: transparent;
    border: 1px solid #0E0E0E; padding: 8px 20px; cursor: pointer;
    transition: background .2s, color .2s;
  }
  .lp-navbtn:hover { background: #0E0E0E; color: #F0EDE6; }

  /* ── hero ───────────────────────────────── */
  .lp-main {
    height: 100vh; background: #F0EDE6;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 56px clamp(16px, 4vw, 24px) 0;
  }

  .lp-eyebrow {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .3em;
    color: #888880; margin-bottom: 40px;
    opacity: 0; animation: lp-fadein .5s ease .1s forwards;
  }

  .lp-title {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(56px, 13vw, 180px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.025em; line-height: .9;
    color: #0E0E0E; margin-bottom: 24px;
    max-width: 100%;
  }
  .lp-title .lp-c {
    display: inline-block; opacity: 0; transform: translateY(-10px);
    transition: opacity .09s ease, transform .09s ease;
  }
  .lp-title .lp-c.in { opacity: 1; transform: translateY(0); }

  .lp-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 12px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .3em;
    color: #888880; margin-bottom: 48px;
    opacity: 0; transition: opacity .6s ease;
  }
  .lp-sub.in { opacity: 1; }

  .lp-cycler {
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 13px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .12em;
    color: #0E0E0E; min-height: 20px; margin-bottom: 64px;
    opacity: 0; transition: opacity .4s ease;
  }
  .lp-cycler.in { opacity: 1; }
  .lp-vcur {
    display: inline-block; width: 1.5px; height: 13px;
    background: #6B1FFF; margin-left: 2px; vertical-align: middle;
    animation: lp-blink .7s step-end infinite;
  }

  /* ── form block ─────────────────────────── */
  .lp-form-block { width: 100%; max-width: 500px; }

  .lp-form-heading {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 32px; font-weight: 700;
    text-transform: uppercase; letter-spacing: -.01em;
    color: #0E0E0E; margin-bottom: 8px;
  }
  .lp-form-rule { height: 1px; background: #6B1FFF; margin-bottom: 8px; }
  .lp-form-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .22em;
    color: #888880; margin-bottom: 24px;
  }
  .lp-form-row { display: flex; border: 1px solid #0E0E0E; margin-bottom: 12px; }
  .lp-input {
    flex: 1; min-width: 0; background: transparent; border: none;
    padding: 14px 16px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .08em;
    color: #0E0E0E; outline: none;
  }
  .lp-input::placeholder { color: #888880; }
  .lp-btn {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; font-weight: 500;
    text-transform: uppercase; letter-spacing: .14em;
    color: #F0EDE6; background: #0E0E0E;
    border: none; border-left: 1px solid #0E0E0E;
    padding: 14px 22px; cursor: pointer; white-space: nowrap;
    transition: background .2s ease;
  }
  .lp-btn:hover { background: #6B1FFF; }
  .lp-counter {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .2em;
    color: #6B1FFF; text-align: center;
  }

  /* ── demo section ───────────────────────── */
  .lp-demo {
    background: #F0EDE6;
    padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .lp-demo-label {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 11px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .3em;
    color: #888880;
    margin-bottom: 10px;
    text-align: center;
  }

  .lp-demo-rule {
    width: 60px; height: 1px;
    background: #6B1FFF;
    margin-bottom: 24px;
    flex-shrink: 0;
  }

  /* browser chrome */
  .lp-browser {
    width: 100%; max-width: 860px;
    border: 1px solid #D0CCC4;
  }

  .lp-browser-bar {
    background: #E8E4DC;
    padding: 9px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #D0CCC4;
  }

  .lp-browser-dots {
    display: flex; gap: 5px; flex-shrink: 0;
  }
  .lp-dot { width: 10px; height: 10px; border-radius: 50%; }
  .lp-dot-r { background: #FF5F57; }
  .lp-dot-y { background: #FFBD2E; }
  .lp-dot-g { background: #28C840; }

  .lp-url-bar {
    flex: 1; min-width: 0;
    background: #D8D4CC;
    border-radius: 3px;
    height: 22px;
  }

  /* browser body: two columns */
  .lp-browser-body {
    display: flex;
  }

  .lp-col {
    flex: 1; min-width: 0;
    padding: clamp(16px, 2.5vw, 28px);
  }
  .lp-col + .lp-col {
    border-left: 1px solid #D0CCC4;
  }

  /* column header row */
  .lp-col-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 8px;
  }
  .lp-col-hdr-left {
    display: flex; align-items: center; gap: 6px;
  }
  .lp-col-dot {
    width: 6px; height: 6px;
    border-radius: 50%; flex-shrink: 0;
  }
  .lp-col-dot-gray  { background: #888880; }
  .lp-col-dot-vi    { background: #6B1FFF; }

  .lp-col-lbl {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .2em;
    color: #888880;
  }
  .lp-col-lbl-dark { color: #0E0E0E; }

  .lp-match-badge {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .06em;
    color: #FFFFFF;
    background: #6B1FFF;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .lp-col-text-ai {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(11px, 1.4vw, 13px); line-height: 1.75;
    color: #999990;
  }
  .lp-col-text-you {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(11px, 1.4vw, 13px); line-height: 1.75;
    color: #0E0E0E;
  }

  /* scroll reveal */
  #lp-col-ai {
    opacity: 0;
    transition: opacity .5s ease;
  }
  #lp-col-ai.in { opacity: 1; }

  #lp-col-you {
    opacity: 0;
    transform: translateX(10px);
    transition: opacity .5s ease .3s, transform .5s ease .3s;
  }
  #lp-col-you.in { opacity: 1; transform: translateX(0); }

  .lp-demo-caption {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .2em;
    color: #888880;
    margin-top: 20px;
    text-align: center;
  }

  /* ── dark section ───────────────────────── */
  .lp-dark {
    background: #0E0E0E;
    padding: clamp(40px, 6vw, 80px) clamp(16px, 4vw, 48px);
    overflow: hidden;
  }

  .lp-dark-yellow {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(48px, 10vw, 160px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.02em; line-height: .88;
    color: #C8F400; white-space: nowrap;
    opacity: 0; transform: translateX(-48px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .lp-dark-yellow.in { opacity: 1; transform: translateX(0); }

  .lp-dark-ghosts {
    display: flex; gap: clamp(16px, 4vw, 48px); flex-wrap: wrap;
    opacity: 0;
    transition: opacity .5s ease .3s;
  }
  .lp-dark-ghosts.in { opacity: 1; }

  .lp-ghost-1 {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(48px, 10vw, 160px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.02em; line-height: .88;
    color: transparent; white-space: nowrap;
    -webkit-text-stroke: 1.5px #2a2a2a;
  }
  .lp-ghost-2 {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(48px, 10vw, 160px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.02em; line-height: .88;
    color: transparent; white-space: nowrap;
    -webkit-text-stroke: 1.5px #3a3a3a;
  }

  .lp-dark-bar {
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
    margin-top: 48px;
    padding-top: 20px;
    border-top: 1px solid #1a1a1a;
  }
  .lp-dark-tag {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .15em;
    color: #666660;
  }

  /* ── footer (static) ────────────────────── */
  .lp-footer {
    background: #F0EDE6;
    height: 44px; padding: 0 clamp(16px, 4vw, 40px);
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid #0E0E0E;
  }
  .lp-ft {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .2em; color: #888880;
  }

  /* ── keyframes ──────────────────────────── */
  @keyframes lp-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes lp-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── responsive ─────────────────────────── */
  @media (max-width: 640px) {
    .lp-browser-body { flex-direction: column; }
    .lp-col + .lp-col { border-left: none; border-top: 1px solid #D0CCC4; }
    #lp-col-you { transform: translateX(0); }
  }

  @media (max-width: 480px) {
    .lp-form-row { flex-direction: column; }
    .lp-btn {
      border-left: none; border-top: 1px solid #0E0E0E;
      padding: 14px; width: 100%;
    }
  }

  @media (max-width: 560px) {
    .lp-dark-ghosts { gap: 16px; }
  }
`

const PHRASES = [
  "YOUR VOICE. NOT A ROBOT'S.",
  "AI TEXT THAT SOUNDS LIKE YOU.",
  "WRITE LESS. SOUND MORE.",
]

export default function LandingPage() {
  const navRef    = useRef<HTMLElement>(null)
  const curRef    = useRef<HTMLDivElement>(null)
  const titleRef  = useRef<HTMLHeadingElement>(null)
  const subRef    = useRef<HTMLParagraphElement>(null)
  const cyclerRef = useRef<HTMLDivElement>(null)
  const cyclerTxt = useRef<HTMLSpanElement>(null)
  const emailRef  = useRef<HTMLInputElement>(null)

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
    return () => {
      document.body.classList.remove('lp')
      document.removeEventListener('mousemove', move)
    }
  }, [])

  /* nav border on scroll */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const fn = () => nav.classList.toggle('scrolled', window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* title → subtitle → cycler */
  useEffect(() => {
    const title = titleRef.current
    if (!title) return
    title.innerHTML = ''
    ;[...'VERBALY'].forEach((ch, i) => {
      const s = document.createElement('span')
      s.className = 'lp-c'
      s.textContent = ch
      title.appendChild(s)
      setTimeout(() => s.classList.add('in'), 260 + i * 30)
    })

    const afterTitle = 260 + 7 * 30 + 110
    setTimeout(() => {
      subRef.current?.classList.add('in')
      setTimeout(startCycler, 380)
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
            setTimeout(() => { paused = false; del = true; tick() }, 1500)
            return
          }
          setTimeout(tick, 40)
        } else {
          t.textContent = p.slice(0, --ci)
          if (ci === 0) {
            del = false
            pi = (pi + 1) % PHRASES.length
            setTimeout(tick, 420)
            return
          }
          setTimeout(tick, 24)
        }
      }
      setTimeout(tick, 200)
    }
  }, [])

  /* demo section scroll reveal */
  useEffect(() => {
    const ai  = document.getElementById('lp-col-ai')
    const you = document.getElementById('lp-col-you')
    if (!ai) return
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        ai.classList.add('in')
        you?.classList.add('in')
        io.disconnect()
      }
    }, { threshold: 0.2 })
    io.observe(ai)
    return () => io.disconnect()
  }, [])

  /* dark section scroll animation */
  useEffect(() => {
    const yellow = document.getElementById('lp-yellow')
    const ghosts = document.getElementById('lp-ghosts')
    if (!yellow || !ghosts) return
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        yellow.classList.add('in')
        setTimeout(() => ghosts.classList.add('in'), 300)
        io.disconnect()
      }
    }, { threshold: 0.15 })
    io.observe(yellow)
    return () => io.disconnect()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = emailRef.current
    if (!input) return
    const email = input.value.trim()
    if (!email) return
    window.open(
      `https://useverbalyapp.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`,
      '_blank',
      'noopener,noreferrer'
    )
    input.value = ''
    input.placeholder = "YOU'RE ON THE LIST. CHECK YOUR EMAIL."
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div id="lp-grain" aria-hidden="true" />
      <div ref={curRef} id="lp-cur" aria-hidden="true" />

      {/* ── NAV ─────────────────────────────── */}
      <nav ref={navRef} className="lp-nav" role="navigation">
        <a href="/" className="lp-logo">Verbaly</a>
        <button
          className="lp-navbtn"
          onClick={() => emailRef.current?.focus()}
          aria-label="Join the waitlist"
        >
          Join Waitlist
        </button>
      </nav>

      {/* ── HERO / WAITLIST ─────────────────── */}
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
          <form className="lp-form-row" onSubmit={handleSubmit} noValidate>
            <input
              ref={emailRef}
              className="lp-input"
              type="email"
              placeholder="Your email address"
              autoComplete="email"
              required
              aria-label="Email address"
            />
            <button className="lp-btn" type="submit">Join &rarr;</button>
          </form>
          <p className="lp-counter" aria-label="247 people already waiting">
            &#10022;&nbsp;247 People Already Waiting
          </p>
        </div>

      </main>

      {/* ── DEMO SECTION ────────────────────── */}
      <section className="lp-demo" aria-label="See the difference">

        <p className="lp-demo-label">See the Difference</p>
        <div className="lp-demo-rule" aria-hidden="true" />

        {/* mock browser window */}
        <div className="lp-browser" role="img" aria-label="Before and after comparison">

          {/* browser chrome bar */}
          <div className="lp-browser-bar" aria-hidden="true">
            <div className="lp-browser-dots">
              <span className="lp-dot lp-dot-r" />
              <span className="lp-dot lp-dot-y" />
              <span className="lp-dot lp-dot-g" />
            </div>
            <div className="lp-url-bar" />
          </div>

          {/* two-column body */}
          <div className="lp-browser-body">

            {/* left: AI generated */}
            <div id="lp-col-ai" className="lp-col">
              <div className="lp-col-hdr">
                <div className="lp-col-hdr-left">
                  <span className="lp-col-dot lp-col-dot-gray" aria-hidden="true" />
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

            {/* right: your voice */}
            <div id="lp-col-you" className="lp-col">
              <div className="lp-col-hdr">
                <div className="lp-col-hdr-left">
                  <span className="lp-col-dot lp-col-dot-vi" aria-hidden="true" />
                  <span className="lp-col-lbl lp-col-lbl-dark">Your Voice</span>
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

      {/* ── DARK SECTION ────────────────────── */}
      <section className="lp-dark" aria-label="Your voice, everywhere">

        <p id="lp-yellow" className="lp-dark-yellow">YOUR VOICE.</p>

        <div id="lp-ghosts" className="lp-dark-ghosts" aria-hidden="true">
          <span className="lp-ghost-1">SOUNDS LIKE YOU.</span>
          <span className="lp-ghost-2">EVERY WHERE.</span>
        </div>

        <div className="lp-dark-bar">
          <span className="lp-dark-tag">Trained on your writing. Applied to everything.</span>
          <span className="lp-dark-tag">No credit card ever required</span>
        </div>

      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className="lp-footer" role="contentinfo">
        <span className="lp-ft">&copy; Verbaly 2026</span>
        <span className="lp-ft">Everything Sounds Like You</span>
      </footer>
    </>
  )
}

'use client'

import { useEffect, useRef } from 'react'

const CSS = `
  /* ── tokens ─────────────────────────────── */
  :root {
    --paper:  #F0EDE6;
    --ink:    #0E0E0E;
    --violet: #6B1FFF;
    --gray:   #888880;
    --fh: 'Courier Prime', 'Courier New', monospace;
    --fb: 'JetBrains Mono', 'Courier New', monospace;
  }

  /* ── base ───────────────────────────────── */
  html, body { height: 100%; background: #F0EDE6; }
  body {
    margin: 0; padding: 0;
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
    pointer-events: none;
    z-index: 800;
    opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
  }

  /* ── nav ────────────────────────────────── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 200;
    height: 56px; padding: 0 40px;
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
    border: 1px solid #0E0E0E;
    padding: 8px 20px; cursor: pointer;
    transition: background .2s, color .2s;
  }
  .lp-navbtn:hover { background: #0E0E0E; color: #F0EDE6; }

  /* ── main / hero ────────────────────────── */
  .lp-main {
    height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 56px 24px 44px;
  }

  /* eyebrow */
  .lp-eyebrow {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 11px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .3em;
    color: #888880;
    margin-bottom: 40px;
    opacity: 0;
    animation: lp-fadein .5s ease .1s forwards;
  }

  /* title */
  .lp-title {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(72px, 13vw, 180px);
    font-weight: 700; text-transform: uppercase;
    letter-spacing: -.025em; line-height: .9;
    color: #0E0E0E;
    margin-bottom: 24px;
  }
  .lp-title .lp-c {
    display: inline-block;
    opacity: 0; transform: translateY(-10px);
    transition: opacity .09s ease, transform .09s ease;
  }
  .lp-title .lp-c.in { opacity: 1; transform: translateY(0); }

  /* subtitle */
  .lp-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 12px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .3em;
    color: #888880;
    margin-bottom: 48px;
    opacity: 0; transition: opacity .6s ease;
  }
  .lp-sub.in { opacity: 1; }

  /* cycler */
  .lp-cycler {
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 13px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .12em;
    color: #0E0E0E;
    min-height: 20px;
    margin-bottom: 64px;
    opacity: 0; transition: opacity .4s ease;
  }
  .lp-cycler.in { opacity: 1; }

  .lp-vcur {
    display: inline-block;
    width: 1.5px; height: 13px;
    background: #6B1FFF;
    margin-left: 2px; vertical-align: middle;
    animation: lp-blink .7s step-end infinite;
  }

  /* form block */
  .lp-form-block { width: 100%; max-width: 500px; }

  .lp-form-heading {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 32px; font-weight: 700;
    text-transform: uppercase; letter-spacing: -.01em;
    color: #0E0E0E;
    margin-bottom: 8px;
  }

  .lp-form-rule {
    height: 1px; background: #6B1FFF;
    margin-bottom: 8px;
  }

  .lp-form-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .22em;
    color: #888880;
    margin-bottom: 24px;
  }

  .lp-form-row {
    display: flex;
    border: 1px solid #0E0E0E;
    margin-bottom: 12px;
  }

  .lp-input {
    flex: 1; min-width: 0;
    background: transparent; border: none;
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
    padding: 14px 22px; cursor: pointer;
    white-space: nowrap;
    transition: background .2s ease;
  }
  .lp-btn:hover { background: #6B1FFF; }

  .lp-counter {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .2em;
    color: #6B1FFF; text-align: center;
  }

  /* footer */
  .lp-footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 44px; padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid #0E0E0E;
    background: #F0EDE6;
    z-index: 100;
  }
  .lp-ft {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400;
    text-transform: uppercase; letter-spacing: .2em;
    color: #888880;
  }

  /* keyframes */
  @keyframes lp-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes lp-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* mobile */
  @media (max-width: 560px) {
    .lp-nav    { padding: 0 20px; }
    .lp-main   { padding: 56px 20px 44px; }
    .lp-footer { padding: 0 20px; }
    .lp-form-row { flex-direction: column; }
    .lp-btn {
      border-left: none; border-top: 1px solid #0E0E0E;
      padding: 14px; width: 100%;
    }
  }
`

const PHRASES = [
  "YOUR VOICE. NOT A ROBOT'S.",
  "AI TEXT THAT SOUNDS LIKE YOU.",
  "WRITE LESS. SOUND MORE.",
]

export default function LandingPage() {
  const navRef     = useRef<HTMLElement>(null)
  const curRef     = useRef<HTMLDivElement>(null)
  const titleRef   = useRef<HTMLHeadingElement>(null)
  const subRef     = useRef<HTMLParagraphElement>(null)
  const cyclerRef  = useRef<HTMLDivElement>(null)
  const cyclerTxt  = useRef<HTMLSpanElement>(null)
  const emailRef   = useRef<HTMLInputElement>(null)

  /* custom cursor */
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

      {/* grain */}
      <div id="lp-grain" aria-hidden="true" />

      {/* cursor */}
      <div ref={curRef} id="lp-cur" aria-hidden="true" />

      {/* nav */}
      <nav ref={navRef} className="lp-nav" role="navigation" aria-label="Main navigation">
        <a href="/" className="lp-logo" aria-label="Verbaly home">Verbaly</a>
        <button
          className="lp-navbtn"
          onClick={() => emailRef.current?.focus()}
          aria-label="Join the waitlist"
        >
          Join Waitlist
        </button>
      </nav>

      {/* hero — the whole page */}
      <main className="lp-main" role="main">

        <p className="lp-eyebrow">Pre-Launch &middot; AI Writing Tool</p>

        <h1
          ref={titleRef}
          className="lp-title"
          aria-label="Verbaly"
        />

        <p ref={subRef} className="lp-sub">
          Everything Sounds Like You
        </p>

        <div
          ref={cyclerRef}
          className="lp-cycler"
          aria-live="polite"
          aria-atomic="true"
        >
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
            <button className="lp-btn" type="submit">
              Join &rarr;
            </button>
          </form>
          <p className="lp-counter" aria-label="247 people already waiting">
            &#10022;&nbsp;247 People Already Waiting
          </p>
        </div>

      </main>

      {/* footer */}
      <footer className="lp-footer" role="contentinfo">
        <span className="lp-ft">&copy; Verbaly 2026</span>
        <span className="lp-ft">Everything Sounds Like You</span>
      </footer>
    </>
  )
}

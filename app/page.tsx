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

  /* ── hero — two-column ─────────────────────── */
  .lp-main {
    background: #FFFFFF;
    display: flex; flex-direction: row;
    align-items: center; min-height: 100vh;
    padding: 80px clamp(16px, 4vw, 48px) 60px;
    gap: clamp(20px, 4vw, 60px);
  }

  /* eyebrow */
  .lp-eyebrow {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400; text-transform: uppercase;
    letter-spacing: .3em; color: rgba(0,0,0,0.3);
    margin-bottom: 24px;
    opacity: 0; animation: lp-fadein .6s ease .1s forwards;
  }

  /* left column */
  .lp-hero-left {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; align-items: flex-start;
  }

  /* CLI boot sequence */
  .lp-cli {
    margin-bottom: 22px; min-height: 88px;
    opacity: 0; transition: opacity .3s ease;
  }
  .lp-cli.in { opacity: 1; }
  .lp-cli-line {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 12px; color: rgba(0,0,0,0.35);
    letter-spacing: .02em; line-height: 2;
    white-space: nowrap;
  }
  .lp-cli-cur {
    display: inline-block; width: 7px; height: 13px;
    background: #7B5CF0; vertical-align: middle; margin-left: 3px;
    animation: lp-blink .7s step-end infinite;
  }

  /* final headline */
  .lp-headline {
    opacity: 0; transform: translateY(10px);
    transition: opacity .5s ease, transform .5s ease;
    margin-bottom: 14px;
  }
  .lp-headline.in { opacity: 1; transform: translateY(0); }
  .lp-hl-main {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(32px, 4.8vw, 68px);
    font-weight: 700; color: #0E0E0E;
    letter-spacing: -.025em; line-height: .95;
    text-transform: uppercase; display: block;
  }
  .lp-hl-code {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: clamp(12px, 1.5vw, 19px); font-weight: 400;
    color: #7B5CF0; letter-spacing: .02em;
    display: block; margin-top: 10px;
  }
  .lp-hl-tick { opacity: 0.4; }

  /* subheadline */
  .lp-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: clamp(10px, .95vw, 12px); color: rgba(0,0,0,0.45);
    line-height: 1.8; letter-spacing: .03em;
    max-width: 400px; margin-bottom: 28px;
    opacity: 0; transition: opacity .5s ease .1s;
  }
  .lp-sub.in { opacity: 1; }
  .lp-sub-code {
    background: rgba(123,92,240,0.08); color: #7B5CF0;
    padding: 1px 5px; border-radius: 2px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
  }

  /* right column — terminal panel */
  .lp-hero-right {
    flex: 1; min-width: 0;
    opacity: 0; transform: translateX(16px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .lp-hero-right.in { opacity: 1; transform: translateX(0); }

  .lp-panel { border: 1px solid #E0E0E0; }
  .lp-panel-bar {
    background: #F5F5F5; padding: 7px 12px;
    display: flex; align-items: center; gap: 8px;
    border-bottom: 1px solid #E0E0E0;
  }
  .lp-panel-dots { display: flex; gap: 5px; flex-shrink: 0; }
  .lp-pdot { width: 9px; height: 9px; border-radius: 50%; }
  .lp-pdot-r { background: #FF5F57; }
  .lp-pdot-y { background: #FFBD2E; }
  .lp-pdot-g { background: #28C840; }
  .lp-panel-fname {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9px; color: rgba(0,0,0,0.3); letter-spacing: .12em;
    text-transform: uppercase; margin-left: auto;
  }
  .lp-pane-ai {
    background: #0E0E0E;
    padding: clamp(12px, 1.8vw, 20px) clamp(14px, 2vw, 22px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .lp-pane-you {
    background: #FFFFFF;
    padding: clamp(12px, 1.8vw, 20px) clamp(14px, 2vw, 22px);
  }
  .lp-pane-tag {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9px; text-transform: uppercase; letter-spacing: .18em;
    margin-bottom: 8px;
  }
  .lp-pane-tag-muted  { color: rgba(255,255,255,0.2); }
  .lp-pane-tag-active { color: #7B5CF0; }
  .lp-pane-hdr {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 8px;
  }
  .lp-pane-body-ai {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(10px, 1vw, 12px); line-height: 1.65;
    color: rgba(255,255,255,0.18);
  }
  .lp-pane-body-you {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(10px, 1vw, 12px); line-height: 1.65;
    color: #0E0E0E;
  }
  .lp-pane-cur {
    display: inline-block; width: 2px; height: 12px;
    background: #7B5CF0; vertical-align: middle; margin-left: 1px;
    animation: lp-blink .8s step-end infinite;
  }
  .lp-pane-badge {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9px; text-transform: uppercase; letter-spacing: .1em;
    color: #FFFFFF; background: #7B5CF0;
    padding: 2px 7px; border-radius: 2px; white-space: nowrap;
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
    display: flex; flex-direction: column;
    padding: clamp(48px, 7vh, 96px) clamp(40px, 8vw, 120px);
    overflow: hidden;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  /* three lines packed tight */
  .lp-voice-lines {
    display: flex; flex-direction: column;
    justify-content: center;
    gap: 0;
  }

  /* font size: ~15–20% larger than previous iteration */
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
  @keyframes lp-blink      { 0%,100%{opacity:1;} 50%{opacity:0;} }
  @keyframes lp-fadein     { from{opacity:0;} to{opacity:1;} }
  @keyframes lp-success-in { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
  @keyframes lp-check-pulse{ 0%,100%{transform:scale(1);} 50%{transform:scale(1.25);} }
  @keyframes lp-count-up   { from{opacity:0;transform:translateY(7px);} to{opacity:1;transform:translateY(0);} }

  /* ── responsive ────────────────────────────── */
  @media (max-width: 860px) {
    .lp-main { flex-direction: column; padding-top: 90px; gap: 36px; min-height: auto; padding-bottom: 60px; }
    .lp-hero-left { align-items: center; text-align: center; }
    .lp-sub { max-width: 100%; }
    .lp-hero-right { width: 100%; transform: translateX(0); }
    .lp-form-block { width: 100%; }
  }
  @media (max-width: 640px) {
    .lp-browser-body { flex-direction: column; }
    .lp-col + .lp-col { border-left: none; border-top: 1px solid #E0E0E0; }
    #lp-col-you { transform: translateX(0); }
    .lp-voice { padding-left: clamp(20px, 5vw, 60px); padding-right: clamp(20px, 5vw, 60px); }
  }
  @media (max-width: 480px) {
    .lp-form-row { flex-direction: column; }
    .lp-btn { border-left: none; border-top: 1px solid #0E0E0E; padding: 14px; width: 100%; }
  }
`

const CLI_LINES = [
  '> init verbaly.engine',
  '> voice_match: 94%',
  '> style: sharp, direct, human',
  '> output: ready.',
]

export default function LandingPage() {
  const navRef      = useRef<HTMLElement>(null)
  const curRef      = useRef<HTMLDivElement>(null)
  const cliRef      = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const subRef      = useRef<HTMLParagraphElement>(null)
  const rightRef    = useRef<HTMLDivElement>(null)
  const emailRef    = useRef<HTMLInputElement>(null)

  const [joinState, setJoinState] = useState<'idle' | 'success'>('idle')
  const [count,     setCount]     = useState(247)

  /* canvas favicon */
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32; canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(0, 0, 32, 32)
    ctx.fillStyle = '#CCFF00'
    ctx.font = 'bold 24px "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('V', 16, 17)
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link')
    link.rel = 'icon'
    link.href = canvas.toDataURL()
    document.head.appendChild(link)
  }, [])

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

  /* CLI boot → headline reveal */
  useEffect(() => {
    const cliEl = cliRef.current
    const hl    = headlineRef.current
    const sub   = subRef.current
    const right = rightRef.current
    if (!cliEl) return
    const c: HTMLDivElement = cliEl

    c.classList.add('in')

    function typeLine(idx: number, onDone: () => void) {
      if (idx >= CLI_LINES.length) { onDone(); return }
      const text = CLI_LINES[idx]
      const div  = document.createElement('div')
      div.className = 'lp-cli-line'
      const txt = document.createElement('span')
      const cur = document.createElement('span')
      cur.className = 'lp-cli-cur'
      div.appendChild(txt)
      div.appendChild(cur)
      c.appendChild(div)
      let i = 0
      function tick() {
        txt.textContent = text.slice(0, ++i)
        if (i < text.length) setTimeout(tick, 26)
        else { cur.remove(); setTimeout(() => typeLine(idx + 1, onDone), 180) }
      }
      tick()
    }

    setTimeout(() => {
      typeLine(0, () => {
        setTimeout(() => {
          c.style.transition = 'opacity .35s ease'
          c.style.opacity = '0'
          setTimeout(() => {
            c.style.display = 'none'
            hl?.classList.add('in')
            setTimeout(() => {
              sub?.classList.add('in')
              right?.classList.add('in')
            }, 200)
          }, 350)
        }, 700)
      })
    }, 400)
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = emailRef.current
    if (!input) return
    const email = input.value.trim()
    if (!email) return
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute;'
    iframe.src = `https://magic.beehiiv.com/v1/5dbf8d69-9f54-4ee0-9658-260b88b823cb?email=${encodeURIComponent(email)}`
    document.body.appendChild(iframe)
    setTimeout(() => document.body.removeChild(iframe), 5000)
    setJoinState('success')
    setCount(c => c + 1)
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

        {/* Left column */}
        <div className="lp-hero-left">

          <p className="lp-eyebrow">Pre-Launch &middot; Turn AI Text Into Your Voice</p>

          {/* CLI boot sequence */}
          <div ref={cliRef} className="lp-cli" aria-live="polite" />

          {/* Final headline */}
          <div ref={headlineRef} className="lp-headline" aria-label="Your voice. Rendered perfectly.">
            <span className="lp-hl-main">Your voice.</span>
            <span className="lp-hl-code">
              <span className="lp-hl-tick">`</span>rendered perfectly.<span className="lp-hl-tick">`</span>
            </span>
          </div>

          {/* Subheadline */}
          <p ref={subRef} className="lp-sub">
            Verbaly analyzes your <span className="lp-sub-code">writing_patterns</span> and rewrites any AI&nbsp;text to sound unmistakably like you.
          </p>

          {/* Waitlist form */}
          <div className="lp-form-block">
            <p className="lp-form-heading">Join the Waitlist</p>
            <div className="lp-form-rule" aria-hidden="true" />
            <p className="lp-form-sub">Free Pro Access &middot; First 500 People</p>

            {joinState === 'success' ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                backgroundColor: '#0E0E0E', padding: '13px 18px', marginBottom: '12px',
                borderRadius: '2px',
                animation: 'lp-success-in 0.4s ease-out forwards',
              }}>
                <span style={{
                  color: '#CCFF00', fontSize: '15px', lineHeight: 1, flexShrink: 0,
                  display: 'inline-block',
                  animation: 'lp-check-pulse 0.5s ease-out 0.15s both',
                }}>✓</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: '11px', textTransform: 'uppercase' as const,
                  letterSpacing: '.12em', color: '#CCFF00', fontWeight: '500',
                }}>You&apos;re in. Welcome to the waitlist.</span>
              </div>
            ) : (
              <form className="lp-form-row" onSubmit={handleSubmit} noValidate>
                <input
                  ref={emailRef} className="lp-input" type="email"
                  placeholder="Your email address" autoComplete="email"
                  required aria-label="Email address"
                />
                <button className="lp-btn" type="submit">Join →</button>
              </form>
            )}

            <p className="lp-counter" aria-label={`${count} people already waiting`}>
              &#10022;&nbsp;<span
                key={count}
                style={{ display: 'inline-block', animation: 'lp-count-up 0.35s ease-out' }}
              >{count}</span> People Already Waiting
            </p>
          </div>

        </div>{/* /lp-hero-left */}

        {/* Right column — split terminal panel */}
        <div ref={rightRef} className="lp-hero-right">
          <div className="lp-panel">
            <div className="lp-panel-bar" aria-hidden="true">
              <div className="lp-panel-dots">
                <span className="lp-pdot lp-pdot-r" />
                <span className="lp-pdot lp-pdot-y" />
                <span className="lp-pdot lp-pdot-g" />
              </div>
              <span className="lp-panel-fname">verbaly_output.txt</span>
            </div>

            {/* AI pane */}
            <div className="lp-pane-ai">
              <div className="lp-pane-tag lp-pane-tag-muted">// AI_OUTPUT.txt</div>
              <p className="lp-pane-body-ai">
                In today&rsquo;s competitive landscape, leveraging cutting-edge artificial
                intelligence solutions enables organizations to optimize operational
                efficiency and maximize stakeholder value through data-driven
                decision-making processes.
              </p>
            </div>

            {/* Your Voice pane */}
            <div className="lp-pane-you">
              <div className="lp-pane-hdr">
                <span className="lp-pane-tag lp-pane-tag-active">// YOUR_VOICE.txt</span>
                <span className="lp-pane-badge">94% match</span>
              </div>
              <p className="lp-pane-body-you">
                Here&rsquo;s the thing &mdash; most companies are sitting on AI tools
                and still wondering why nothing&rsquo;s getting faster. The data&rsquo;s
                there. The decisions aren&rsquo;t.<span className="lp-pane-cur" aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>{/* /lp-hero-right */}

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

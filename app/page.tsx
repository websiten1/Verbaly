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
    align-items: center;
    padding: 72px clamp(16px, 4vw, 48px) 48px;
    gap: clamp(20px, 4vw, 60px);
  }

  /* eyebrow */
  .lp-eyebrow {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 400; text-transform: uppercase;
    letter-spacing: .3em; color: rgba(0,0,0,0.3);
    margin-bottom: 18px;
    opacity: 0; animation: lp-fadein .6s ease .1s forwards;
  }

  /* VERBALY brand heading */
  .lp-verbaly {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(52px, 7.5vw, 104px);
    font-weight: 700; color: #0E0E0E;
    letter-spacing: -.03em; line-height: 1;
    text-transform: uppercase;
    margin-bottom: 24px;
    opacity: 0; animation: lp-fadein .6s ease .2s forwards;
  }

  /* left column */
  .lp-hero-left {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; align-items: flex-start;
  }

  /* CLI boot sequence */
  .lp-cli {
    margin-bottom: 0;
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

  /* right column — form only */
  .lp-hero-right {
    flex: 1; min-width: 0;
    opacity: 0; animation: lp-fadein .6s ease .4s forwards;
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

  /* ── identity section (passport + code cards) ─ */
  .lp-id-section {
    background: #FFFFFF;
    border-top: 1px solid #E0E0E0;
    padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px);
  }
  .lp-id-inner {
    display: flex; gap: clamp(24px, 5vw, 72px);
    align-items: flex-start;
  }
  .lp-id-left  { flex: 1; min-width: 0; }
  .lp-id-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }

  /* passport card shell */
  .lp-passport {
    border: 1px solid #0E0E0E;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    overflow: hidden;
  }
  .lp-pp-hdr {
    background: #0E0E0E; padding: 8px 14px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .lp-pp-hdr-left { display: flex; align-items: center; gap: 8px; }
  .lp-pp-hdot { width: 7px; height: 7px; border-radius: 50%; background: #7B5CF0; }
  .lp-pp-doc {
    font-size: 9px; text-transform: uppercase; letter-spacing: .18em;
    color: rgba(255,255,255,0.45);
  }
  .lp-pp-issuer {
    font-size: 9px; text-transform: uppercase; letter-spacing: .15em;
    color: rgba(255,255,255,0.22);
  }

  /* body: portrait left, fields right */
  .lp-pp-body {
    display: flex; border-bottom: 1px solid #E0E0E0;
  }
  .lp-pp-portrait {
    width: 96px; flex-shrink: 0;
    border-right: 1px solid #E0E0E0;
    display: flex; align-items: center; justify-content: center;
    padding: 14px 8px;
    background: #FAFAFA;
  }
  .lp-pp-fields {
    flex: 1; padding: 12px 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .lp-pp-field {
    display: flex; gap: 6px; align-items: baseline;
    opacity: 0;
  }
  .lp-pp-fields-active .lp-pp-field:nth-child(1) { animation: lp-fadein .25s ease 0.05s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(2) { animation: lp-fadein .25s ease 0.2s  forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(3) { animation: lp-fadein .25s ease 0.35s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(4) { animation: lp-fadein .25s ease 0.5s  forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(5) { animation: lp-fadein .25s ease 0.65s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(6) { animation: lp-fadein .25s ease 0.8s  forwards; }
  .lp-pp-lbl {
    font-size: 8px; text-transform: uppercase; letter-spacing: .14em;
    color: rgba(0,0,0,0.28); white-space: nowrap; flex-shrink: 0;
    min-width: 108px;
  }
  .lp-pp-val {
    font-size: 10px; text-transform: uppercase; letter-spacing: .06em;
    color: #0E0E0E; font-weight: 500;
  }
  .lp-pp-val-accent { color: #7B5CF0; }

  /* MRZ line */
  .lp-pp-mrz {
    padding: 7px 14px;
    font-size: 8.5px; letter-spacing: .06em;
    color: rgba(0,0,0,0.18); white-space: nowrap;
    overflow: hidden; font-family: 'Courier New', monospace;
    border-top: 1px dashed #E0E0E0;
    background: #FAFAFA;
  }

  /* code snippet cards */
  .lp-code-card {
    border: 1px solid #2A2A2A;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    overflow: hidden;
  }
  .lp-code-card:nth-child(2) { margin-left: 20px; }
  .lp-code-card:nth-child(3) { margin-left: 10px; }
  .lp-code-card-hdr {
    background: #1A1A1A; padding: 8px 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .lp-code-card-hdot { width: 7px; height: 7px; border-radius: 50%; background: #7B5CF0; }
  .lp-code-card-fname {
    font-size: 9px; letter-spacing: .08em;
    color: rgba(255,255,255,0.35);
  }
  .lp-code-card-body {
    background: #111111; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .lp-code-line {
    font-size: 11px; color: rgba(255,255,255,0.3);
    letter-spacing: .02em; line-height: 1.9;
    white-space: nowrap;
  }
  .lp-code-val  { color: #7B5CF0; }
  .lp-code-str  { color: rgba(204,255,0,0.65); }
  .lp-code-key  { color: rgba(255,255,255,0.55); }

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
    .lp-main { flex-direction: column; padding-top: 80px; gap: 32px; padding-bottom: 48px; }
    .lp-hero-left { align-items: center; text-align: center; }
    .lp-hero-right { width: 100%; }
    .lp-form-block { width: 100%; }
    .lp-id-inner { flex-direction: column; }
    .lp-code-card:nth-child(2) { margin-left: 0; }
    .lp-code-card:nth-child(3) { margin-left: 0; }
    .lp-pp-portrait { width: 80px; }
    .lp-pp-lbl { min-width: 90px; }
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
  const navRef           = useRef<HTMLElement>(null)
  const curRef           = useRef<HTMLDivElement>(null)
  const cliRef           = useRef<HTMLDivElement>(null)
  const emailRef         = useRef<HTMLInputElement>(null)
  const passportFieldsRef = useRef<HTMLDivElement>(null)

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

  /* CLI boot — type all lines, leave blinking cursor at end */
  useEffect(() => {
    const cliEl = cliRef.current
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
        /* add persistent blinking cursor on its own line */
        const div = document.createElement('div')
        div.className = 'lp-cli-line'
        const cur = document.createElement('span')
        cur.className = 'lp-cli-cur'
        div.appendChild(cur)
        c.appendChild(div)
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

  /* passport fields scroll reveal */
  useEffect(() => {
    const fields = passportFieldsRef.current
    if (!fields) return
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fields.classList.add('lp-pp-fields-active')
        io.disconnect()
      }
    }, { threshold: 0.2 })
    io.observe(fields)
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

        {/* Left column — eyebrow + VERBALY + CLI */}
        <div className="lp-hero-left">
          <p className="lp-eyebrow">Pre-Launch &middot; Turn AI Text Into Your Voice</p>
          <h1 className="lp-verbaly">Verbaly</h1>
          <div ref={cliRef} className="lp-cli" aria-live="polite" />
        </div>

        {/* Right column — waitlist form */}
        <div className="lp-hero-right">
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
        </div>

      </main>

      {/* ── IDENTITY SECTION — passport + code cards ─── */}
      <section className="lp-id-section" aria-label="Voice Identity">
        <div className="lp-id-inner">

          {/* Left — passport card */}
          <div className="lp-id-left">
            <div className="lp-passport" role="img" aria-label="Verbaly Voice ID passport card">

              <div className="lp-pp-hdr">
                <div className="lp-pp-hdr-left">
                  <span className="lp-pp-hdot" aria-hidden="true" />
                  <span className="lp-pp-doc">Voice&nbsp;ID&nbsp;Document</span>
                </div>
                <span className="lp-pp-issuer">Verbaly&nbsp;/&nbsp;Auth</span>
              </div>

              <div className="lp-pp-body">
                <div className="lp-pp-portrait" aria-hidden="true">
                  <svg viewBox="0 0 100 120" width="80" height="96" fill="none">
                    <line x1="50" y1="4" x2="50" y2="116" stroke="#7B5CF0" strokeWidth="0.6" strokeDasharray="2.5 2"/>
                    <path d="M50,10 C34,10 22,20 20,42 C18,58 22,76 32,88 L50,92"
                          stroke="#0E0E0E" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M20,48 C15,51 15,57 20,59" stroke="#0E0E0E" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="38" y1="92" x2="38" y2="108" stroke="#0E0E0E" strokeWidth="1.4"/>
                    <line x1="50" y1="108" x2="38" y2="108" stroke="#0E0E0E" strokeWidth="1.4"/>
                    <path d="M50,10 C66,10 78,20 80,42 C82,58 78,76 68,88 L50,92"
                          stroke="rgba(0,0,0,0.18)" strokeWidth="1" strokeDasharray="3 2"/>
                    <path d="M80,48 C85,51 85,57 80,59" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/>
                    <line x1="62" y1="92" x2="62" y2="108" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="2 2"/>
                    <line x1="50" y1="108" x2="62" y2="108" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="2 2"/>
                    <text x="53" y="34" fontFamily="'Courier New', monospace" fontSize="8" fill="rgba(0,0,0,0.28)">[- -]</text>
                    <text x="53" y="50" fontFamily="'Courier New', monospace" fontSize="7.5" fill="rgba(0,0,0,0.22)">|o o|</text>
                    <text x="53" y="66" fontFamily="'Courier New', monospace" fontSize="7.5" fill="rgba(0,0,0,0.18)">|---|</text>
                    <text x="53" y="82" fontFamily="'Courier New', monospace" fontSize="7" fill="rgba(0,0,0,0.13)">+---+</text>
                  </svg>
                </div>

                <div ref={passportFieldsRef} className="lp-pp-fields">
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Document Type</span>
                    <span className="lp-pp-val">Voice_ID</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Issuing Auth</span>
                    <span className="lp-pp-val">Verbaly</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Voice Owner</span>
                    <span className="lp-pp-val">[you]</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Style</span>
                    <span className="lp-pp-val">Sharp&nbsp;·&nbsp;Direct&nbsp;·&nbsp;Human</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Match Score</span>
                    <span className="lp-pp-val lp-pp-val-accent">94%</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Status</span>
                    <span className="lp-pp-val lp-pp-val-accent">Authenticated ✓</span>
                  </div>
                </div>
              </div>

              <div className="lp-pp-mrz" aria-hidden="true">
                VRBLY&lt;&lt;YOUR&lt;VOICE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;94
              </div>

            </div>
          </div>

          {/* Right — code snippet cards */}
          <div className="lp-id-right">

            <div className="lp-code-card">
              <div className="lp-code-card-hdr">
                <span className="lp-code-card-hdot" aria-hidden="true" />
                <span className="lp-code-card-fname">// voice_profile.js</span>
              </div>
              <div className="lp-code-card-body">
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> analyzing sentence_rhythm<span className="lp-code-val">...</span> done</div>
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> avg_sentence_len: <span className="lp-code-val">11.4 words</span></div>
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> tone: <span className="lp-code-str">&quot;direct, no fluff&quot;</span></div>
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> hedge_words: <span className="lp-code-val">0.3%</span> <span className="lp-code-str">// very low</span></div>
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> voice_model: <span className="lp-code-val">built ✓</span></div>
              </div>
            </div>

            <div className="lp-code-card">
              <div className="lp-code-card-hdr">
                <span className="lp-code-card-hdot" aria-hidden="true" />
                <span className="lp-code-card-fname">// style_dna.json</span>
              </div>
              <div className="lp-code-card-body">
                <div className="lp-code-line">{'{'}</div>
                <div className="lp-code-line">&nbsp;&nbsp;<span className="lp-code-str">&quot;punctuation&quot;</span>: <span className="lp-code-str">&quot;em-dash heavy&quot;</span>,</div>
                <div className="lp-code-line">&nbsp;&nbsp;<span className="lp-code-str">&quot;openings&quot;</span>: <span className="lp-code-str">&quot;question or contrast&quot;</span>,</div>
                <div className="lp-code-line">&nbsp;&nbsp;<span className="lp-code-str">&quot;match_score&quot;</span>: <span className="lp-code-val">94</span></div>
                <div className="lp-code-line">{'}'}</div>
              </div>
            </div>

            <div className="lp-code-card">
              <div className="lp-code-card-hdr">
                <span className="lp-code-card-hdot" aria-hidden="true" />
                <span className="lp-code-card-fname">// rewrite.log</span>
              </div>
              <div className="lp-code-card-body">
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> input: <span className="lp-code-str">AI_generated_text.txt</span></div>
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> applying voice_model<span className="lp-code-val">...</span></div>
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> humanized: <span className="lp-code-val">true</span></div>
                <div className="lp-code-line"><span className="lp-code-key">&gt;</span> output: <span className="lp-code-str">sounds_like_you.txt</span> <span className="lp-code-val">✓</span></div>
              </div>
            </div>

          </div>
        </div>
      </section>

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

'use client'

import { useEffect, useRef, useState } from 'react'

/* ── Design tokens ─────────────────────────────── */
// black: #0A0A0A  lime: #CCFF00  white: #FFFFFF  purple: #7B5CF0
// green (waitlist): #00FF87  yellow (badge): #F5C200

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

  /* PRE-LAUNCH badge */
  .lp-badge {
    display: inline-block;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .22em; color: #0A0A0A;
    background: #F5C200;
    padding: 4px 10px;
    margin-bottom: 20px;
    opacity: 0; animation: lp-fadein .6s ease .1s forwards;
  }

  /* VERBALY brand heading */
  .lp-verbaly {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(52px, 7.5vw, 104px);
    font-weight: 700; color: #0E0E0E;
    letter-spacing: -.03em; line-height: 1;
    text-transform: uppercase;
    margin-bottom: 20px;
    opacity: 0; animation: lp-fadein .6s ease .2s forwards;
  }

  /* hero subheadline */
  .lp-hero-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: clamp(13px, 1.6vw, 18px); font-weight: 400;
    text-transform: uppercase; letter-spacing: .12em;
    color: rgba(0,0,0,0.5); line-height: 1.5;
    max-width: 440px;
    opacity: 0; animation: lp-fadein .6s ease .3s forwards;
  }

  /* left column */
  .lp-hero-left {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; align-items: flex-start;
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
    color: #0E0E0E; margin-bottom: 20px;
  }
  .lp-form-sub {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .22em;
    color: rgba(0,0,0,0.4); margin-bottom: 20px;
  }
  .lp-form-row {
    display: flex; border: 1px solid #0E0E0E; margin-bottom: 12px;
    transition: border-color .2s;
  }
  .lp-form-row:focus-within { border-color: #00FF87; }
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
    letter-spacing: .14em; color: #0A0A0A; background: #00FF87;
    border: none; border-left: 1px solid #00FF87;
    padding: 14px 22px; cursor: pointer; white-space: nowrap;
    transition: background .2s ease;
  }
  .lp-btn:hover:not(:disabled) { background: #00cc6a; }
  .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .lp-counter {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .2em;
    color: #00FF87; text-align: center;
  }

  /* ── identity section (passport + features) ── */
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
  .lp-id-right { flex: 1; min-width: 0; }

  /* passport card shell */
  .lp-passport {
    border: 1px solid #0E0E0E;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    overflow: hidden; position: relative;
  }
  .lp-passport::before {
    content: 'VERBALY';
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 72px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: rgba(0,0,0,0.03);
    transform: rotate(-25deg);
    pointer-events: none; user-select: none;
    z-index: 0;
  }
  .lp-pp-hdr {
    background: #0E0E0E; padding: 8px 14px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 1;
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
    position: relative; z-index: 1;
  }
  .lp-pp-portrait {
    width: 84px; flex-shrink: 0;
    border-right: 1px solid #E0E0E0;
    display: flex; align-items: center; justify-content: center;
    padding: 12px 6px;
    background: #FAFAFA;
  }
  .lp-pp-fields {
    flex: 1; padding: 10px 14px;
    display: flex; flex-direction: column; gap: 5px;
  }
  .lp-pp-field {
    display: flex; gap: 6px; align-items: baseline;
    opacity: 0;
  }
  .lp-pp-fields-active .lp-pp-field:nth-child(1) { animation: lp-fadein .25s ease 0.05s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(2) { animation: lp-fadein .25s ease 0.18s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(3) { animation: lp-fadein .25s ease 0.31s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(4) { animation: lp-fadein .25s ease 0.44s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(5) { animation: lp-fadein .25s ease 0.57s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(6) { animation: lp-fadein .25s ease 0.70s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(7) { animation: lp-fadein .25s ease 0.83s forwards; }
  .lp-pp-fields-active .lp-pp-field:nth-child(8) { animation: lp-fadein .25s ease 0.96s forwards; }
  .lp-pp-lbl {
    font-size: 7.5px; text-transform: uppercase; letter-spacing: .14em;
    color: rgba(0,0,0,0.28); white-space: nowrap; flex-shrink: 0;
    min-width: 120px;
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
    position: relative; z-index: 1;
  }

  /* ── voice dimensions list ──────────────────── */
  .lp-feat-eyebrow {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: .3em;
    color: rgba(0,0,0,0.3); margin-bottom: 24px;
  }
  .lp-feat-list {
    display: flex; flex-direction: column;
  }
  .lp-feat-item {
    padding: 14px 0;
    border-top: 1px solid #F0F0F0;
  }
  .lp-feat-lbl {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; font-weight: 500; text-transform: uppercase;
    letter-spacing: .18em; color: #0E0E0E;
    margin-bottom: 4px;
  }
  .lp-feat-desc {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 10px; color: rgba(0,0,0,0.38);
    letter-spacing: .03em; line-height: 1.6;
  }

  /* ── no credit card strip ───────────────────── */
  .lp-noccard {
    background: #0A0A0A;
    padding: 32px clamp(16px, 4vw, 48px);
    text-align: center;
  }
  .lp-noccard-text {
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: clamp(24px, 3.8vw, 52px); font-weight: 700;
    text-transform: uppercase; letter-spacing: -.01em;
    color: #FFFFFF;
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
    .lp-main { flex-direction: column; padding-top: 80px; gap: 32px; padding-bottom: 48px; }
    .lp-hero-left { align-items: center; text-align: center; }
    .lp-hero-sub { text-align: center; max-width: 100%; }
    .lp-hero-right { width: 100%; }
    .lp-form-block { width: 100%; }
    .lp-id-inner { flex-direction: column; }
    .lp-pp-portrait { width: 72px; }
    .lp-pp-lbl { min-width: 100px; }
  }
  @media (max-width: 640px) {
    .lp-browser-body { flex-direction: column; }
    .lp-col + .lp-col { border-left: none; border-top: 1px solid #E0E0E0; }
    #lp-col-you { transform: translateX(0); }
    .lp-voice { padding-left: clamp(20px, 5vw, 60px); padding-right: clamp(20px, 5vw, 60px); }
  }
  @media (max-width: 480px) {
    .lp-form-row { flex-direction: column; }
    .lp-btn { border-left: none; border-top: 1px solid #00FF87; padding: 14px; width: 100%; }
  }
`

export default function LandingPage() {
  const navRef            = useRef<HTMLElement>(null)
  const curRef            = useRef<HTMLDivElement>(null)
  const emailRef          = useRef<HTMLInputElement>(null)
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

        {/* Left column — badge + VERBALY + subheadline */}
        <div className="lp-hero-left">
          <span className="lp-badge">Pre-Launch</span>
          <h1 className="lp-verbaly">Verbaly</h1>
          <p className="lp-hero-sub">Turn AI text into your voice</p>
        </div>

        {/* Right column — waitlist form */}
        <div className="lp-hero-right">
          <div className="lp-form-block">
            <p className="lp-form-heading">Join the Waitlist</p>
            <p className="lp-form-sub">Free Pro Access &middot; First 500 People</p>

            {joinState === 'success' ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                backgroundColor: '#0E0E0E', padding: '13px 18px', marginBottom: '12px',
                borderRadius: '2px',
                animation: 'lp-success-in 0.4s ease-out forwards',
              }}>
                <span style={{
                  color: '#00FF87', fontSize: '15px', lineHeight: 1, flexShrink: 0,
                  display: 'inline-block',
                  animation: 'lp-check-pulse 0.5s ease-out 0.15s both',
                }}>✓</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: '11px', textTransform: 'uppercase' as const,
                  letterSpacing: '.12em', color: '#00FF87', fontWeight: '500',
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

      {/* ── IDENTITY SECTION — passport + voice dimensions ─── */}
      <section className="lp-id-section" aria-label="Voice Identity">
        <div className="lp-id-inner">

          {/* Left — passport card */}
          <div className="lp-id-left">
            <div className="lp-passport" role="img" aria-label="Verbaly Voice Passport">

              <div className="lp-pp-hdr">
                <div className="lp-pp-hdr-left">
                  <span className="lp-pp-hdot" aria-hidden="true" />
                  <span className="lp-pp-doc">Voice&nbsp;Passport</span>
                </div>
                <span className="lp-pp-issuer">Verbaly&nbsp;/&nbsp;Auth</span>
              </div>

              <div className="lp-pp-body">
                {/* SVG portrait — abstract half human / half bracket grid */}
                <div className="lp-pp-portrait" aria-hidden="true">
                  <svg viewBox="0 0 90 110" width="70" height="88" fill="none">
                    {/* center divider */}
                    <line x1="45" y1="4" x2="45" y2="106" stroke="#7B5CF0" strokeWidth="0.5" strokeDasharray="2.5 2"/>

                    {/* left half — clean minimal human outline */}
                    <path d="M45,8 C31,8 20,17 18,38 C16,53 20,70 30,82 L45,85"
                          stroke="#0E0E0E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* left ear */}
                    <path d="M18,43 C13,46 13,52 18,54" stroke="#0E0E0E" strokeWidth="1.3" strokeLinecap="round"/>
                    {/* left neck */}
                    <line x1="35" y1="85" x2="35" y2="100" stroke="#0E0E0E" strokeWidth="1.3"/>
                    <line x1="45" y1="100" x2="35" y2="100" stroke="#0E0E0E" strokeWidth="1.3"/>

                    {/* right half — dissolves into bracket/grid chars */}
                    <text x="46" y="22" fontFamily="'Courier New', monospace" fontSize="7" fill="rgba(0,0,0,0.22)">/ \</text>
                    <text x="46" y="33" fontFamily="'Courier New', monospace" fontSize="7" fill="rgba(0,0,0,0.20)">[   ]</text>
                    <text x="47" y="44" fontFamily="'Courier New', monospace" fontSize="6.5" fill="rgba(0,0,0,0.17)">|   |</text>
                    <text x="47" y="55" fontFamily="'Courier New', monospace" fontSize="6.5" fill="rgba(0,0,0,0.14)">|___|</text>
                    <text x="48" y="66" fontFamily="'Courier New', monospace" fontSize="6" fill="rgba(0,0,0,0.11)">+---+</text>
                    <text x="48" y="76" fontFamily="'Courier New', monospace" fontSize="5.5" fill="rgba(0,0,0,0.08)">|   |</text>
                    <text x="49" y="86" fontFamily="'Courier New', monospace" fontSize="5" fill="rgba(0,0,0,0.06)">+--+</text>
                  </svg>
                </div>

                {/* Passport fields */}
                <div ref={passportFieldsRef} className="lp-pp-fields">
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Document Type</span>
                    <span className="lp-pp-val">Voice_Passport</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Holder</span>
                    <span className="lp-pp-val">[First]&nbsp;[Last]</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Origin</span>
                    <span className="lp-pp-val">AI_Generated_Text</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Destination</span>
                    <span className="lp-pp-val lp-pp-val-accent">Your_Voice</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Detection Risk</span>
                    <span className="lp-pp-val lp-pp-val-accent">None</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Match Score</span>
                    <span className="lp-pp-val lp-pp-val-accent">94%</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Valid For</span>
                    <span className="lp-pp-val">Unlimited&nbsp;Rewrites</span>
                  </div>
                  <div className="lp-pp-field">
                    <span className="lp-pp-lbl">Status</span>
                    <span className="lp-pp-val lp-pp-val-accent">Cleared&nbsp;for&nbsp;Departure&nbsp;✓</span>
                  </div>
                </div>
              </div>

              <div className="lp-pp-mrz" aria-hidden="true">
                VRBLY&lt;&lt;YOUR&lt;VOICE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;94
              </div>

            </div>
          </div>

          {/* Right — voice dimensions */}
          <div className="lp-id-right">
            <p className="lp-feat-eyebrow">Voice Dimensions</p>
            <div className="lp-feat-list">
              {[
                { lbl: 'Punctuation Patterns',   desc: 'Em-dash usage, ellipsis frequency, comma rhythm' },
                { lbl: 'Sentence Structure',      desc: 'Fragment tolerance, average length, clause depth' },
                { lbl: 'Vocabulary Fingerprint',  desc: 'Word choice, formality level, preferred synonyms' },
                { lbl: 'Tone Markers',            desc: 'Directness, humor index, hedging frequency' },
                { lbl: 'Opening Hooks',           desc: 'How you start sentences and paragraphs' },
                { lbl: 'Passive Voice Ratio',     desc: 'How often you let the subject act vs. be acted on' },
              ].map(({ lbl, desc }) => (
                <div key={lbl} className="lp-feat-item">
                  <div className="lp-feat-lbl">{lbl}</div>
                  <div className="lp-feat-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── NO CREDIT CARD STRIP ─── */}
      <div className="lp-noccard" aria-label="No credit card ever">
        <p className="lp-noccard-text">No credit card. Ever.</p>
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

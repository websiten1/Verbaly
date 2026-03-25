import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WaitlistForm from '@/components/WaitlistForm'

/* ─── Shared mono label ──────────────────────────────────── */
function Label({ children, color = '#666666' }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-jet)',
      fontSize: '10px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color,
    }}>
      {children}
    </p>
  )
}

/* ─── Section divider ────────────────────────────────────── */
function VioletRule() {
  return <div style={{ height: '1px', backgroundColor: '#6B1FFF' }} />
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#F5F2ED' }}>

      {/* ════════════════════════════════════════════════════════
          SECTION 1 — HERO  (warm paper, film grain)
      ════════════════════════════════════════════════════════ */}
      <section
        className="grain"
        style={{
          backgroundColor: '#F5F2ED',
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Navbar />

        {/* Three-column hero body */}
        <div style={{
          flex: 1,
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: '80px 32px 0',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '24px',
          alignItems: 'center',
        }}
        className="hero-grid"
        >

          {/* LEFT — VERBALY wordmark */}
          <div style={{ paddingBottom: '48px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(56px, 9vw, 136px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                lineHeight: 0.92,
                color: '#111111',
                animation: 'typeReveal 0.9s steps(7, end) both',
              }}
            >
              VERBA
              <br />
              LY
            </h1>

            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label>Everything sounds like you</Label>
              <Label color="#AAAAAA">Pre-launch · Join the waitlist</Label>
            </div>
          </div>

          {/* CENTER — Robot hand */}
          <div
            style={{
              width: 'clamp(220px, 28vw, 400px)',
              height: 'clamp(340px, 50vw, 640px)',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Image
              src="/hand.png"
              alt="Robotic hand holding an ivory feather"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center bottom' }}
              className="animate-breathe"
              priority
            />
          </div>

          {/* RIGHT — waitlist CTA */}
          <div
            id="waitlist"
            style={{
              paddingBottom: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '20px',
              scrollMarginTop: '80px',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(32px, 5vw, 72px)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.92,
                  color: '#111111',
                }}
              >
                WAIT
                <br />
                LIST
              </h2>
              <div style={{ marginTop: '12px' }}>
                <Label>Right here →</Label>
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: '340px' }}>
              <WaitlistForm compact />
            </div>

            <div style={{ textAlign: 'right' }}>
              <Label color="#AAAAAA">Free Pro access · First 500 people</Label>
              <div style={{ marginTop: '6px' }}>
                <Label color="#6B1FFF">🙋 247 already waiting</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: violet rule */}
        <div style={{ marginTop: 'auto' }}>
          <VioletRule />
        </div>
      </section>

      {/* Responsive hero override */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto;
            padding-top: 96px !important;
            gap: 40px !important;
          }
          .hero-grid > div:nth-child(1) { padding-bottom: 0 !important; }
          .hero-grid > div:nth-child(2) {
            width: clamp(200px, 70vw, 300px) !important;
            height: clamp(300px, 60vw, 440px) !important;
            margin: 0 auto;
          }
          .hero-grid > div:nth-child(3) {
            align-items: flex-start !important;
            padding-bottom: 48px !important;
          }
        }
      `}</style>


      {/* ════════════════════════════════════════════════════════
          SECTION 2 — GLITCH BANNER  (ink black, acid yellow)
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0E0E0E', overflow: 'hidden', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>

          {/* Main acid yellow text */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(72px, 14vw, 196px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                lineHeight: 0.88,
                color: '#D4F000',
                animation: 'glitchShift 7s ease-in-out infinite',
                animationDelay: '2s',
              }}
            >
              YOUR
              <br />
              VOICE.
            </p>
            {/* Ghost offset layer */}
            <p
              aria-hidden
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(72px, 14vw, 196px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                lineHeight: 0.88,
                color: '#D4F000',
                opacity: 0.06,
                position: 'absolute',
                top: '5px',
                left: '8px',
                inset: 'auto',
                pointerEvents: 'none',
              }}
            >
              YOUR
              <br />
              VOICE.
            </p>
          </div>

          {/* Right-aligned secondary line */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(72px, 14vw, 196px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              lineHeight: 0.88,
              color: '#0E0E0E',
              WebkitTextStroke: '1px #D4F000',
              textAlign: 'right',
              opacity: 0.6,
            }}
          >
            EVERY
            <br />
            WHERE.
          </p>

          {/* Sub-label */}
          <div style={{ marginTop: '48px', borderTop: '1px solid #222222', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Label color="#444444">Trained on your writing. Applied to everything.</Label>
            <Label color="#D4F000">No credit card ever required</Label>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════
          SECTION 3 — MORE THAN A REWRITER  (white, editorial)
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '48px',
            alignItems: 'start',
          }}
          className="editorial-grid"
          >

            {/* Left: main header */}
            <div>
              <h2
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 'clamp(28px, 4vw, 52px)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1.05,
                  color: '#111111',
                }}
              >
                MORE
                <br />
                THAN A
                <br />
                REWRITER.
              </h2>
            </div>

            {/* Center: single violet word */}
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-jet)',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  color: '#6B1FFF',
                }}
              >
                LOOK AROUND ↓
              </p>
            </div>

            {/* Right: body copy */}
            <div style={{ paddingTop: '8px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-jet)',
                  fontSize: '13px',
                  fontWeight: 300,
                  lineHeight: 1.85,
                  color: '#666666',
                  letterSpacing: '0.03em',
                }}
              >
                Verbaly learns the six dimensions of your writing: vocabulary fingerprint, sentence rhythm, punctuation habits, tone markers, favorite phrases, and what you never do.
                <br /><br />
                Then it applies all of it — to anything. AI draft, blank page, rough notes. The output sounds like you. Because it is.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .editorial-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          }
        `}</style>
      </section>


      {/* ════════════════════════════════════════════════════════
          SECTION 4 — FEATURES IN FOCUS  (ink black)
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0E0E0E', position: 'relative', overflow: 'hidden', minHeight: '520px' }}>

        {/* Green circle — the only green on the page */}
        <div style={{
          position: 'absolute',
          right: '-80px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(280px, 35vw, 520px)',
          height: 'clamp(280px, 35vw, 520px)',
          borderRadius: '50%',
          backgroundColor: '#22C55E',
          border: '2px solid #6B1FFF',
          opacity: 0.92,
        }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 32px', position: 'relative', zIndex: 1, minHeight: '520px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Tags — top right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
              {['VOICE ANALYSIS', 'STYLE REWRITING', 'TONE CONTROL', 'INTENSITY DIAL', 'REWRITE HISTORY'].map((tag) => (
                <Label key={tag} color="#444444">{tag}</Label>
              ))}
            </div>
          </div>

          {/* Heading — bottom left */}
          <div>
            <p
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 'clamp(28px, 5vw, 64px)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1.05,
                color: '#FFFFFF',
              }}
            >
              FEATURES
              <br />
              IN FOCUS.
            </p>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════
          SECTION 5 — VOICE DIMENSIONS  (warm paper, brutal type)
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#F5F2ED' }}>
        {/* Torn-edge divider feel */}
        <div style={{ height: '1px', backgroundColor: '#111111' }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 32px' }}>

          {/* Massive header */}
          <div style={{ marginBottom: '64px' }}>
            <h2
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 'clamp(36px, 7vw, 96px)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                lineHeight: 1.0,
                color: '#111111',
              }}
            >
              STYLE DIMENSIONS
              <br />
              <span style={{ WebkitTextStroke: '1px #111111', color: 'transparent' }}>
                THAT KEEP YOUR
              </span>
              <br />
              PROSE REAL.
            </h2>
          </div>

          {/* Dimension tags — small, typographic grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0',
            borderTop: '1px solid #111111',
          }}>
            {[
              { label: 'VOCABULARY PRINT', sub: 'The exact words you reach for' },
              { label: 'SENTENCE RHYTHM', sub: 'Your pace, pauses and fragments' },
              { label: 'PUNCTUATION STYLE', sub: 'Em-dashes, ellipses, colons' },
              { label: 'TONE MARKERS', sub: 'Formal, conversational, sharp' },
              { label: 'PHRASE PATTERNS', sub: '"Here\'s the thing" and 40 more' },
              { label: 'AVOIDANCE RULES', sub: 'What you never write' },
            ].map(({ label, sub }) => (
              <div
                key={label}
                style={{
                  borderBottom: '1px solid #111111',
                  borderRight: '1px solid #111111',
                  padding: '28px 24px',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#111111',
                  marginBottom: '8px',
                }}>
                  {label}
                </p>
                <Label color="#888888">{sub}</Label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#111111' }} />
      </section>


      {/* ════════════════════════════════════════════════════════
          SECTION 6 — FINAL WAITLIST CTA  (white, oversized type)
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 32px' }}>

          {/* Enormous flanking type */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            lineHeight: 0.88,
          }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(72px, 14vw, 200px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.04em',
                color: '#111111',
              }}
            >
              BE
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(72px, 14vw, 200px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.04em',
                color: '#111111',
                textAlign: 'right',
              }}
            >
              FIRST
            </span>
          </div>

          {/* Violet underline accent on "WAITLIST" */}
          <div style={{ textAlign: 'center', margin: '-24px 0 0' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(40px, 7vw, 96px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                color: '#111111',
                borderBottom: '4px solid #6B1FFF',
                paddingBottom: '4px',
              }}
            >
              WAITLIST
            </span>
          </div>

          {/* Social proof + form */}
          <div style={{
            maxWidth: '480px',
            margin: '56px auto 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-jet)',
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#666666',
              lineHeight: 1.7,
            }}>
              Join writers, students, bloggers and marketers
              <br />who want their voice back.
            </p>

            <div style={{ width: '100%' }}>
              <WaitlistForm />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Label color="#AAAAAA">Free Pro access for the first 500 people</Label>
              <Label color="#6B1FFF">🙋 247 people already waiting</Label>
            </div>
          </div>

          {/* FAQ — inline, minimal */}
          <div style={{
            maxWidth: '800px',
            margin: '96px auto 0',
            borderTop: '1px solid #111111',
          }}>
            {[
              {
                q: 'IS THIS JUST AN AI DETECTION BYPASS TOOL?',
                a: "No. Verbaly isn't about hiding AI — it's about making any text sound like you wrote it. Whether you started with AI or a blank page, the output reflects your voice, your style, your rhythm.",
              },
              {
                q: 'WHEN IS VERBALY LAUNCHING?',
                a: 'Soon. Everyone on the waitlist gets notified first and the first 500 get free Pro access at launch.',
              },
              {
                q: 'IS IT REALLY FREE?',
                a: "Yes. Joining the waitlist is free, no credit card needed. We'll have a free tier at launch too.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                style={{
                  borderBottom: '1px solid #E5E5E5',
                  padding: '28px 0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.4fr',
                  gap: '32px',
                  alignItems: 'start',
                }}
                className="faq-row"
              >
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#111111',
                  lineHeight: 1.5,
                }}>
                  {q}
                </p>
                <p style={{
                  fontFamily: 'var(--font-jet)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: '#666666',
                  lineHeight: 1.75,
                  letterSpacing: '0.02em',
                }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .faq-row { grid-template-columns: 1fr !important; gap: 12px !important; }
          }
        `}</style>
      </section>

      <Footer />
    </div>
  )
}

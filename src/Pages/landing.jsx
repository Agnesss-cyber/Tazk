import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Smart Prioritization',
    desc: 'Tasks are automatically ranked by urgency, effort, and due date. Your top 3 tasks of the day are always clear — no guessing.',
  },
  {
    icon: '👥',
    title: 'Workload Visibility',
    desc: 'Managers see exactly who is overloaded and who has capacity, so work is always balanced across the team.',
  },
  {
    icon: '📊',
    title: 'Performance Tracking',
    desc: 'Track who completes tasks on time, who goes the extra mile, and recognize real effort with a live leaderboard.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div>

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="logo">Tazk<span>.</span></div>
        <div className="nav-links">
          <button className="btn-ghost" onClick={() => navigate('/login')}>
            Log in
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            Sign up
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-badge">✦ Built for small teams</div>

        <h1 className="hero-title">
          Get your team's work <span>done</span>
        </h1>

        <p className="hero-sub">
          Tazk helps you organize tasks, track progress, and collaborate
          effortlessly so nothing falls through the cracks.
        </p>

        <div className="hero-actions">
          <button className="btn-primary-lg" onClick={() => navigate('/register')}>
            Get started for free
          </button>
          <button className="btn-outline-lg" onClick={() => navigate('/login')}>
            Log in to your team
          </button>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <p className="section-label">Why Tazk</p>
        <h2 className="section-title">Everything your team needs to ship</h2>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="logo">Tazk<span>.</span></div>
        <div>© {new Date().getFullYear()} Tazk. Built for teams that ship.</div>
      </footer>

    </div>
  )
}
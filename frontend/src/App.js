import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [skills, setSkills] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    axios.get("/skills")
      .then(res => setSuggestions(res.data || []))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSkills(value);
    const filteredSuggestions = (suggestions || []).filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filteredSuggestions.slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skills.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.post("http://localhost:5000/predict", { skills });
      setResults(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
    setLoading(false);
  };

  const EMOJIS = ["💼", "🚀", "🤖", "📊", "💻", "🔬", "⚡", "🌐"];

  return (
    <div className="app">

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">AI Job Matching</div>
        <h1 className="hero-title">
          Find your <span>perfect</span><br />role, instantly
        </h1>
        <p className="hero-sub">
          Enter your skills and discover jobs ranked by match score with learning paths for the gaps.
        </p>

        {/* SEARCH */}
        <div className="search-wrap">
          <form onSubmit={handleSubmit}>
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.5 1a5.5 5.5 0 014.383 8.823l3.896 3.897a.75.75 0 01-1.06 1.06l-3.897-3.896A5.5 5.5 0 116.5 1zm0 1.5a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <input
                className="search-input"
                type="text"
                value={skills}
                onChange={handleChange}
                placeholder="Python, React, AWS, SQL…"
                autoComplete="off"
                onBlur={() => setTimeout(() => setFiltered([]), 150)}
              />
              <button className="search-btn" type="submit" disabled={loading}>
                {loading ? "Searching…" : "Search →"}
              </button>
            </div>
          </form>

          {/* AUTOCOMPLETE */}
          {filtered.length > 0 && (
            <div className="autocomplete">
              {filtered.map((item, i) => (
                <div
                  key={i}
                  className="ac-item"
                  onMouseDown={() => {
                    setSkills(item);
                    setFiltered([]);
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LOADING SKELETONS */}
      {loading && (
        <div className="loading-wrap">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="skeleton">
              <div className="skel-line" style={{ width: "40%", height: "16px", marginBottom: "14px" }} />
              <div className="skel-line" style={{ width: "60%" }} />
              <div className="skel-line" style={{ width: "30%" }} />
              <div className="divider" />
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3].map((_, j) => (
                  <div key={j} className="skel-line" style={{ width: "70px", height: "24px", borderRadius: "6px", margin: 0 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESULTS */}
      {!loading && results.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-label">Results</span>
            <span className="section-count">{results.length} jobs</span>
          </div>

          <div className="cards-grid">
            {results.map((job, i) => {
              const pct = parseFloat(job.match_score) || 0;
              return (
                <div key={i} className="card">
                  <div className="card-top">
                    <div className="card-logo">{EMOJIS[i % EMOJIS.length]}</div>
                    <div className="card-title-group">
                      <p className="card-title">{job.title}</p>
                      <div className="card-meta">
                        <span>{job.company}</span>
                        <span className="meta-dot" />
                        <span>{job.location}</span>
                        <span className="meta-dot" />
                        <span className="tag-work">{job.work_type}</span>
                      </div>
                    </div>
                    <div className="score-badge">
                      <span className="score-num">{job.match_score}</span>
                      <span className="score-label">match</span>
                    </div>
                  </div>

                  <div className="score-bar-wrap">
                    <div className="score-bar" style={{ width: `${pct}%` }} />
                  </div>

                  {(job.matched_skills || []).length > 0 && (
                    <div className="skills-row">
                      <p className="skills-heading">Matched skills</p>
                      <div className="tags">
                        {job.matched_skills.map((s, idx) => (
                          <span key={idx} className="tag tag-green">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(job.missing_skills || []).length > 0 && (
                    <div className="skills-row">
                      <p className="skills-heading">Skills to acquire</p>
                      <div className="tags">
                        {job.missing_skills.map((s, idx) => (
                          <span key={idx} className="tag tag-red">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(job.learning_resources || []).length > 0 && (
                    <div className="skills-row">
                      <p className="skills-heading">Recommended learning</p>
                      <div className="tags">
                        {job.learning_resources.map((l, idx) => (
                          <span key={idx} className="tag tag-blue">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && results.length === 0 && skills && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p className="empty-title">No matches found</p>
          <p className="empty-sub">Try different or fewer skills</p>
        </div>
      )}
    </div>
  );
}

export default App;
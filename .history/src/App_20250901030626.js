// src/App.js
import { useState } from "react";
import usePalette from "./usePalette";

const API = "http://localhost:3001";

function Card({ children, style }) {
  return (
    <div style={{
      background:"#111318", border:"1px solid #2a2e38", borderRadius:12, padding:16, ...style
    }}>{children}</div>
  );
}

function Swatch({ hex, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
      <div style={{ width:28, height:28, borderRadius:6, background:hex, border:"1px solid #333" }} />
      <div style={{ fontFamily:"Inter, system-ui, sans-serif" }}>{label || hex}</div>
    </div>
  );
}

export default function App() {
  const [k, setK] = useState(6);
  const [matches, setMatches] = useState([]); // API results [{target, matches:[...]}]
  const [busy, setBusy] = useState(false);
  const { extract, previewUrl, palette, loading } = usePalette();

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMatches([]);
    await extract(file, k, { ignoreWhites: true, ignoreBlacks: true });
  }

  async function fetchMatches() {
    if (!palette.length) return;
    setBusy(true);
    const res = await fetch(`${API}/match-hex`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hexes: palette, topN: 3 })
    });
    const json = await res.json();
    setMatches(json.results || []);
    setBusy(false);
  }

  // Build deduped shopping list of best matches
  const shoppingSet = new Map();
  for (const r of matches) {
    const best = r.matches?.[0];
    if (best) shoppingSet.set(best.slug || best.name, best); // slug if present
  }
  const shoppingList = Array.from(shoppingSet.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0b0c0f", color:"#e7e7ea", padding:"32px 24px", fontFamily:"Inter, system-ui, sans-serif" }}>
      <h1 style={{ marginBottom:8 }}>Citadel Paint Matcher</h1>
      <p style={{ opacity:.8, marginTop:0 }}>Upload a photo → extract palette (client) → match paints (Lambda).</p>

      <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", marginBottom:16 }}>
        <input type="file" accept="image/*" onChange={onFile} />
        <label>
          k:&nbsp;
          <input type="number" min="3" max="12" value={k} onChange={e=>setK(parseInt(e.target.value||"6",10))}
                 style={{ width:64 }} />
        </label>
        <button onClick={fetchMatches} disabled={!palette.length || loading || busy}
          style={{ padding:"10px 14px", borderRadius:8, border:"1px solid #3b7bfd", background: busy ? "#1f2633" : "#3b7bfd", color:"#fff", cursor:"pointer" }}>
          {busy ? "Matching…" : "Match paints"}
        </button>
      </div>

      {/* Preview + palette */}
      <div style={{ display:"grid", gridTemplateColumns:"minmax(260px, 420px) 1fr", gap:16 }}>
        <Card>
          <div style={{ marginBottom:12, opacity:.8 }}>Preview</div>
          {previewUrl ? (
            <img src={previewUrl} alt="" style={{ width:"100%", borderRadius:10, border:"1px solid #2a2e38" }} />
          ) : (
            <div style={{ height:240, border:"1px dashed #2a2e38", borderRadius:10, display:"grid", placeItems:"center", color:"#9aa2af" }}>
              Select an image…
            </div>
          )}
        </Card>

        <Card>
          <div style={{ marginBottom:12, opacity:.8 }}>
            Palette ({loading ? "extracting…" : `${palette.length} colors`})
          </div>
          {palette.map((hex, i) => <Swatch key={i} hex={hex} />)}
        </Card>
      </div>

      {/* Matches per cluster */}
      {!!matches.length && (
        <div style={{ marginTop:24 }}>
          <h2 style={{ marginBottom:8 }}>Matches</h2>
          <div style={{ display:"grid", gap:16 }}>
            {matches.map((m, i) => (
              <Card key={i}>
                <div style={{ marginBottom:8, opacity:.8 }}>Cluster {i+1} — target {m.target}</div>
                {m.matches.map((p, j) => (
                  <Swatch
                    key={j}
                    hex={p.hex}
                    label={`${p.name} — ${p.range} (${p.finish}) • ${p.hex} • ΔE ${p.deltaE.toFixed(2)}`}
                  />
                ))}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shopping list */}
      {!!shoppingList.length && (
        <div style={{ marginTop:24 }}>
          <h2 style={{ marginBottom:8 }}>Shopping list (best matches)</h2>
          <Card>
            {shoppingList.map((p, i) => (
              <Swatch key={i} hex={p.hex} label={`${p.name} — ${p.range} (${p.finish})`} />
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// src/App.js
import { useState, useEffect } from "react";
import usePalette from "./utils/usePalette";
import PresetSelector from "./components/PresetSelector";
import { PRESET_OPTIONS } from "./utils/presets";

// If using CRA proxy, leave empty; otherwise set REACT_APP_API_BASE in .env.*
const API = process.env.REACT_APP_API_BASE || "";

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#111318",
        border: "1px solid #2a2e38",
        borderRadius: 12,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Swatch({ hex, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: hex, border: "1px solid #333" }} />
      <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>{label || hex}</div>
    </div>
  );
}

// Quick heuristic to choose a preset when user selects "Auto"
async function choosePresetForImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = url;
    });

    const w = 160;
    const h = Math.max(1, Math.round((img.height / img.width) * w));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    let whites = 0,
      blacks = 0,
      pixels = 0,
      blueish = 0;

    // stride a bit to keep it instant
    for (let i = 0; i < data.length; i += 4 * 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];
      if (a < 10) continue;
      pixels++;

      if (r >= 252 && g >= 252 && b >= 252) whites++;
      if (r <= 5 && g <= 5 && b <= 5) blacks++;

      // crude blue-ish check
      if (b > 80 && b > r + 10 && b > g + 10) blueish++;
    }

    const fracWhite = whites / Math.max(1, pixels);
    const fracBlack = blacks / Math.max(1, pixels);
    const fracBlue = blueish / Math.max(1, pixels);

    if (fracWhite > 0.35) return "whiteBackdrop";
    if (fracBlue > 0.02 || (fracBlack > 0.2 && fracBlue > 0.005)) return "darkNavies";
    return "general";
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function App() {
  const [k, setK] = useState(9);
  const [presetKey, setPresetKey] = useState(() => localStorage.getItem("presetKey") || "auto");
  const [matches, setMatches] = useState([]); // [{ target, matches:[...] }]
  const [busy, setBusy] = useState(false);
  const { extract, previewUrl, palette, loading } = usePalette();

  useEffect(() => {
    localStorage.setItem("presetKey", presetKey);
  }, [presetKey]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMatches([]);

    let keyToUse = presetKey;
    if (presetKey === "auto") {
      keyToUse = await choosePresetForImage(file);
    }
    const options = PRESET_OPTIONS[keyToUse] || PRESET_OPTIONS.general;

    await extract(file, k, options);
  }

  async function fetchMatches() {
    if (!palette.length) return;
    setBusy(true);
    const res = await fetch(`${API}/match-hex`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hexes: palette, topN: 3 }),
    });
    const json = await res.json();
    setMatches(json.results || []);
    setBusy(false);
  }

  // Build deduped shopping list of best matches
  const shoppingSet = new Map();
  for (const r of matches) {
    const best = r.matches?.[0];
    if (best) shoppingSet.set(best.slug || best.name, best);
  }
  const shoppingList = Array.from(shoppingSet.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0c0f",
        color: "#e7e7ea",
        padding: "32px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Citadel Paint Matcher</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Upload a photo → extract palette (client) → match paints.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={onFile} />
        <label>
          k:&nbsp;
          <input
            type="number"
            min="3"
            max="12"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value || "9", 10))}
            style={{ width: 64 }}
          />
        </label>

        {/* Preset selector uses your existing component & presets file */}
        <PresetSelector value={presetKey} onChange={setPresetKey} />

        <button
          onClick={fetchMatches}
          disabled={!palette.length || loading || busy}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #3b7bfd",
            background: busy ? "#1f2633" : "#3b7bfd",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {busy ? "Matching…" : "Match paints"}
        </button>
      </div>

      {/* Preview + palette */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 420px) 1fr", gap: 16 }}>
        <Card>
          <div style={{ marginBottom: 12, opacity: 0.8 }}>Preview</div>
          {previewUrl ? (
            <img src={previewUrl} alt="" style={{ width: "100%", borderRadius: 10, border: "1px solid #2a2e38" }} />
          ) : (
            <div
              style={{
                height: 240,
                border: "1px dashed #2a2e38",
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                color: "#9aa2af",
              }}
            >
              Select an image…
            </div>
          )}
        </Card>

        <Card>
          <div style={{ marginBottom: 12, opacity: 0.8 }}>
            Palette ({loading ? "extracting…" : `${palette.length} colors`})
          </div>
          {palette.map((hex, i) => (
            <Swatch key={i} hex={hex} />
          ))}
        </Card>
      </div>

      {/* Matches per cluster */}
      {!!matches.length && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Matches</h2>
          <div style={{ display: "grid", gap: 16 }}>
            {matches.map((m, i) => (
              <Card key={i}>
                <div style={{ marginBottom: 8, opacity: 0.8 }}>
                  Cluster {i + 1} — target {m.target}
                </div>
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
        <div style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Shopping list (best matches)</h2>
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

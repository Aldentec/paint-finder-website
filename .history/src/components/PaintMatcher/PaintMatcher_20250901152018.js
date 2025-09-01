// src/components/PaintMatcher/PaintMatcher.js
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './PaintMatcher.css';
import ImageUploader from '../ImageUploader/ImageUploader';
import PaletteDisplay from '../PaletteDisplay/PaletteDisplay';
import MatchResults from '../MatchResults/MatchResults';
import ShoppingList from '../ShoppingList/ShoppingList';
import usePalette from '../../utils/usePalette';
import PresetSelector from '../PresetSelector/PresetSelector';
import { PRESET_OPTIONS } from '../../utils/presets';

const API_BASE = (process.env.REACT_APP_API_BASE || "https://k6aslecb84.execute-api.us-west-2.amazonaws.com/prod").replace(/\/$/, "");

const PaintMatcher = () => {
  const [k, setK] = useState(9);
  const [presetKey, setPresetKey] = useState(() => localStorage.getItem("presetKey") || "auto");
  const [matches, setMatches] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const { extract, previewUrl, palette, loading } = usePalette();

  useEffect(() => {
    localStorage.setItem("presetKey", presetKey);
  }, [presetKey]);

  // Auto-select preset based on image
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

      let whites = 0, blacks = 0, pixels = 0, blueish = 0;
      
      for (let i = 0; i < data.length; i += 4 * 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 10) continue;
        pixels++;
        if (r >= 252 && g >= 252 && b >= 252) whites++;
        if (r <= 5 && g <= 5 && b <= 5) blacks++;
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

  async function onFileSelect(file) {
    setMatches([]);
    setError("");
    setUploadedImage(file.name);
    
    const pKey = presetKey === "auto" ? await choosePresetForImage(file) : presetKey;
    const preset = PRESET_OPTIONS[pKey] || PRESET_OPTIONS.general;
    
    await extract(file, k, preset);
  }

  async function fetchMatches() {
    if (!palette.length) return;
    
    setError("");
    setBusy(true);
    
    try {
      const res = await fetch(`${API_BASE}/match-hex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hexes: palette, topN: 3 }),
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      setMatches(data.results || []);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError("Failed to fetch paint matches. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Build deduped shopping list
  const shoppingSet = new Map();
  for (const r of matches) {
    const best = r.matches?.[0];
    if (best) shoppingSet.set(best.slug || best.name, best);
  }
  const shoppingList = Array.from(shoppingSet.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "PaintFinder Color Matcher",
            "description": "Upload miniature photos to find matching hobby paints using AI color analysis",
            "url": "https://paintfinder.com/#paint-matcher",
            "applicationCategory": "UtilitiesApplication",
            "featureList": [
              "Image color extraction",
              "AI paint matching", 
              "ΔE2000 color accuracy",
              "Multi-brand paint database",
              "Shopping list generation"
            ]
          })}
        </script>
      </Helmet>

      <main 
        id="paint-matcher" 
        className="paint-matcher"
        role="main"
        aria-labelledby="matcher-heading"
        itemScope
        itemType="https://schema.org/WebApplication"
      >
        <div className="container">
          <header className="section-header">
            <h2 
              id="matcher-heading"
              className="section-title"
              itemProp="name"
            >
              AI Paint Color Matcher
            </h2>
            <p 
              className="section-subtitle"
              itemProp="description"
            >
              Upload your image and find the perfect paint matches using advanced color science
            </p>
          </header>

          <div className="matcher-grid">
            <aside 
              className="upload-section"
              role="complementary"
              aria-labelledby="upload-heading"
            >
              <div className="upload-controls">
                <h3 id="upload-heading" className="sr-only">Upload and Settings</h3>
                
                <div role="group" aria-labelledby="image-upload-label">
                  <ImageUploader 
                    onFileSelect={onFileSelect} 
                    previewUrl={previewUrl}
                    aria-describedby="upload-instructions" 
                  />
                  <p id="upload-instructions" className="sr-only">
                    Upload a photo of your miniature to extract colors and find matching paints
                  </p>
                </div>
                
                <div className="controls" role="group" aria-labelledby="settings-heading">
                  <h4 id="settings-heading" className="sr-only">Color Extraction Settings</h4>
                  
                  <div className="control-group">
                    <label htmlFor="k-value" className="control-label">
                      Number of Colors (k): <span className="range-value">{k}</span>
                    </label>
                    <input
                      id="k-value"
                      type="range"
                      min="3"
                      max="12"
                      value={k}
                      onChange={(e) => setK(parseInt(e.target.value, 10))}
                      className="range-input"
                      aria-describedby="k-value-help"
                    />
                    <p id="k-value-help" className="sr-only">
                      Choose how many dominant colors to extract from your image. More colors provide more paint options but may include less important details.
                    </p>
                  </div>

                  <div className="control-group">
                    <label htmlFor="preset-selector" className="control-label">
                      Image Type Preset
                    </label>
                    <PresetSelector 
                      id="preset-selector"
                      value={presetKey} 
                      onChange={setPresetKey}
                      aria-describedby="preset-help"
                    />
                    <p id="preset-help" className="sr-only">
                      Select the preset that best matches your image type for optimal color extraction results.
                    </p>
                  </div>

                  <button
                    onClick={fetchMatches}
                    disabled={!palette.length || loading || busy}
                    className="match-button"
                    aria-describedby="match-status"
                    type="button"
                  >
                    {busy ? (
                      <>
                        <span className="spinner" aria-hidden="true" role="presentation" />
                        <span>Finding Matches...</span>
                      </>
                    ) : (
                      <>
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          aria-hidden="true"
                          role="presentation"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <span>Match Paints</span>
                      </>
                    )}
                  </button>

                  {error && (
                    <div 
                      className="error-message" 
                      role="alert"
                      aria-live="polite"
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        aria-hidden="true"
                        role="presentation"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {error}
                    </div>
                  )}

                  <div id="match-status" className="sr-only" aria-live="polite">
                    {uploadedImage && `Image uploaded: ${uploadedImage}. `}
                    {palette.length > 0 && `${palette.length} colors extracted. `}
                    {matches.length > 0 && `${matches.length} color matches found. `}
                    {shoppingList.length > 0 && `Shopping list contains ${shoppingList.length} recommended paints.`}
                  </div>
                </div>
              </div>
            </aside>

            <section 
              className="results-section"
              role="region"
              aria-labelledby="results-heading"
            >
              <h3 id="results-heading" className="sr-only">Color Analysis Results</h3>
              
              <PaletteDisplay 
                palette={palette} 
                loading={loading}
                aria-label="Extracted color palette"
              />
              
              {matches.length > 0 && (
                <>
                  <MatchResults 
                    matches={matches}
                    aria-label="Paint matching results"
                  />
                  <ShoppingList 
                    shoppingList={shoppingList}
                    aria-label="Recommended paint shopping list"
                  />
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaintMatcher;
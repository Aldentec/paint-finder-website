// src/usePalette.js
import { useState, useCallback } from "react";
import { kmeans } from "ml-kmeans";
import { converter, formatHex } from "culori";

const toLab = converter("lab");
const toRgb = converter("rgb");
const toLch = converter("lch");

/** Convert RGB [0-255] → Lab array [L, a, b] */
function rgb255ToLab(r, g, b) {
  const lab = toLab({ mode: "rgb", r: r / 255, g: g / 255, b: b / 255 });
  return lab && Number.isFinite(lab.l) ? [lab.l, lab.a, lab.b] : null;
}

/** Convert Lab array [L,a,b] → HEX string */
function labToHex(labArr) {
  if (!Array.isArray(labArr) || labArr.length !== 3) return "#000000";
  const [L, a, b] = labArr;
  const rgb = toRgb({ mode: "lab", l: L, a, b });
  return rgb ? formatHex(rgb).toUpperCase() : "#000000";
}

function lchFromLabArr(labArr) {
  const [L, a, b] = labArr;
  const lch = toLch({ mode: "lab", l: L, a, b });
  // culori returns h in degrees (may be NaN for gray); c >= 0
  return lch;
}

function inHueRange(h, start, end) {
  if (!Number.isFinite(h)) return false;
  // normalize 0..360
  const hue = ((h % 360) + 360) % 360;
  const s = ((start % 360) + 360) % 360;
  const e = ((end % 360) + 360) % 360;
  if (s <= e) return hue >= s && hue <= e;
  // wrap-around
  return hue >= s || hue <= e;
}

export default function usePalette() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [palette, setPalette] = useState([]);           // array of hexes
  const [labCentroids, setLabCentroids] = useState([]); // array of [L,a,b]
  const [loading, setLoading] = useState(false);

  const extract = useCallback(
    async (
      file,
      k = 6,
      options = {}
    ) => {
      setLoading(true);
      setPalette([]);
      setLabCentroids([]);

      const {
        ignoreWhites = true,
        ignoreBlacks = false,
        whiteThresh = 252, // was 245
        blackThresh = 5,  // was 10
        maxWidth = 512,
        sampleStep = 2,    // was 4 → better chance to catch small patches
        minChroma = 2,     // e.g. 5–8 to drop near-grays if needed
        ensureBlue = true,
        blueHueRange = [190, 280], // degrees
        minBlueFraction = 0.001    // 0.3% of samples must be blue to force
      } = options;

      // Preview (revoke old blob to avoid leaks)
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      try {
        // Load image
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = url;
        });

        // Draw to canvas (downscale)
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);

        // Collect Lab samples (+ track blue pixels)
        const labs = [];
        let blueCount = 0;

        for (let i = 0; i < data.length; i += 4 * sampleStep) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2],
            a = data[i + 3];

          if (a < 10) continue; // skip transparent

          // Skip near-white/near-black to reduce background dominance
          if (ignoreWhites && r >= whiteThresh && g >= whiteThresh && b >= whiteThresh) continue;
          if (ignoreBlacks && r <= blackThresh && g <= blackThresh && b <= blackThresh) continue;

          const lab = rgb255ToLab(r, g, b);
          if (!lab) continue;

          // Optional: drop very low-chroma pixels (near-grays)
          if (minChroma > 0) {
            const lch = lchFromLabArr(lab);
            if (!lch || !Number.isFinite(lch.c) || lch.c < minChroma) continue;
          }

          labs.push(lab);

          // Track blue-ish pixels (for ensureBlue)
          if (ensureBlue) {
            const lch = lchFromLabArr(lab);
            if (lch && Number.isFinite(lch.h) && inHueRange(lch.h, blueHueRange[0], blueHueRange[1])) {
              blueCount++;
            }
          }
        }

        if (labs.length === 0) {
          setPalette([]);
          setLabCentroids([]);
          return [];
        }

        // k-means in Lab
        const km = kmeans(labs, k, { initialization: "kmeans++" });

        // ml-kmeans may return centroids as arrays or as objects with .centroid
        let centers = (km.centroids || [])
          .map((c) => (Array.isArray(c) ? c : c?.centroid))
          .filter((c) => Array.isArray(c) && c.length === 3);

        // --- Ensure blue presence if image has enough blue but no blue centroid ---
        if (ensureBlue) {
          const hasEnoughBlue = blueCount / labs.length >= minBlueFraction;
          const centerHasBlue = centers.some((c) => {
            const lch = lchFromLabArr(c);
            return lch && lch.c > 8 && inHueRange(lch.h, blueHueRange[0], blueHueRange[1]);
          });

          if (hasEnoughBlue && !centerHasBlue) {
            // Compute mean of *blue* pixels to seed a blue centroid
            let sumL = 0,
              sumA = 0,
              sumB = 0,
              count = 0;
            for (const lab of labs) {
              const lch = lchFromLabArr(lab);
              if (lch && Number.isFinite(lch.h) && inHueRange(lch.h, blueHueRange[0], blueHueRange[1])) {
                sumL += lab[0];
                sumA += lab[1];
                sumB += lab[2];
                count++;
              }
            }
            if (count > 0) {
              const blueCentroid = [sumL / count, sumA / count, sumB / count];
              // Replace the *most neutral* existing centroid (lowest chroma)
              let minC = Infinity;
              let replaceIdx = 0;
              centers.forEach((c, idx) => {
                const lch = lchFromLabArr(c);
                const cVal = lch && Number.isFinite(lch.c) ? lch.c : 0;
                if (cVal < minC) {
                  minC = cVal;
                  replaceIdx = idx;
                }
              });
              centers[replaceIdx] = blueCentroid;
            }
          }
        }
        // --- end ensure blue ---

        const hexes = centers.map(labToHex);

        setLabCentroids(centers);
        setPalette(hexes);
        return hexes;
      } finally {
        setLoading(false);
      }
    },
    [previewUrl]
  );

  return { extract, previewUrl, palette, labCentroids, loading };
}

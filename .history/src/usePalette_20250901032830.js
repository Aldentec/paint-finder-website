// src/usePalette.js
import { useState, useCallback } from "react";
import { kmeans } from "ml-kmeans";
import { converter, formatHex } from "culori";

const toLab = converter("lab");
const toRgb = converter("rgb");
const toLch = converter("lch");

/** RGB [0-255] → Lab [L,a,b] */
function rgb255ToLab(r, g, b) {
  const lab = toLab({ mode: "rgb", r: r / 255, g: g / 255, b: b / 255 });
  return lab && Number.isFinite(lab.l) ? [lab.l, lab.a, lab.b] : null;
}

/** Lab [L,a,b] → HEX */
function labToHex(arr) {
  if (!Array.isArray(arr) || arr.length !== 3) return "#000000";
  const [L, a, b] = arr;
  const rgb = toRgb({ mode: "lab", l: L, a, b });
  return rgb ? formatHex(rgb).toUpperCase() : "#000000";
}

function lchFromLabArr(arr) {
  const [L, a, b] = arr;
  return toLch({ mode: "lab", l: L, a, b }); // h deg, c≥0 (h may be NaN for grays)
}

function inHueRange(h, start, end) {
  if (!Number.isFinite(h)) return false;
  const hue = ((h % 360) + 360) % 360;
  const s = ((start % 360) + 360) % 360;
  const e = ((end % 360) + 360) % 360;
  return s <= e ? hue >= s && hue <= e : hue >= s || hue <= e; // wrap
}

export default function usePalette() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [palette, setPalette] = useState([]);           // hex[]
  const [labCentroids, setLabCentroids] = useState([]); // [ [L,a,b], ... ]
  const [loading, setLoading] = useState(false);

  const extract = useCallback(async (file, k = 6, options = {}) => {
    setLoading(true);
    setPalette([]);
    setLabCentroids([]);

    const {
      // downscale & sampling
      maxWidth = 640,
      targetSamples = 30000, // hard cap on number of pixels clustered
      // background filters
      ignoreWhites = true,
      ignoreBlacks = false,  // keep dark navies
      whiteThresh = 252,
      blackThresh = 5,
      // color filtering & clustering tweaks
      minChroma = 0,         // keep low-chroma dark colors by default
      chromaticBoost = 1.25, // >1 emphasizes a/b over L
      // blue handling
      ensureBlue = true,
      blueHueRange = [185, 275],
      blueDupes = 3,         // small duplication factor (not huge)
      maxBlueDupes = 5000,   // absolute cap on extra blue samples
      minBlueFraction = 0.00002 // tiny fraction still triggers ensureBlue
    } = options;

    // preview blob
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // load image
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });

      // draw (downscale)
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);

      // adaptive stride so we don't exceed targetSamples
      const totalPixels = w * h;
      const stride = Math.max(1, Math.floor(totalPixels / targetSamples));
      const inc = 4 * stride;

      const labs = [];
      let blueCount = 0;
      let blueExtraAdded = 0;

      for (let i = 0; i < data.length; i += inc) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 10) continue;
        if (ignoreWhites && r >= whiteThresh && g >= whiteThresh && b >= whiteThresh) continue;
        if (ignoreBlacks && r <= blackThresh && g <= blackThresh && b <= blackThresh) continue;

        const lab = rgb255ToLab(r, g, b);
        if (!lab) continue;

        const lch = lchFromLabArr(lab);
        if (minChroma > 0) {
          if (!lch || !Number.isFinite(lch.c) || lch.c < minChroma) continue;
        }

        labs.push(lab);

        // small blue bias without blowing up array size
        if (
          ensureBlue &&
          blueDupes > 1 &&
          blueExtraAdded < maxBlueDupes &&
          lch && Number.isFinite(lch.h) && inHueRange(lch.h, blueHueRange[0], blueHueRange[1])
        ) {
          blueCount++;
          const copies = Math.min(blueDupes - 1, maxBlueDupes - blueExtraAdded);
          for (let t = 0; t < copies; t++) {
            labs.push(lab);
          }
          blueExtraAdded += copies;
        }
      }

      if (labs.length === 0) {
        setPalette([]); setLabCentroids([]); return [];
      }

      // give the UI a breath before clustering
      await new Promise((r) => setTimeout(r, 0));

      // chroma emphasis for clustering
      const boosted = labs.map(([L, a, b]) => [L, a * chromaticBoost, b * chromaticBoost]);
      const km = kmeans(boosted, k, { initialization: "kmeans++" });

      // unwrap & un-boost
      let centers = (km.centroids || [])
        .map(c => (Array.isArray(c) ? c : c?.centroid))
        .filter(c => Array.isArray(c) && c.length === 3)
        .map(([L, a, b]) => [L, a / chromaticBoost, b / chromaticBoost]);

      // ensureBlue fallback: if enough blue pixels but no blue centroid, inject one
      if (ensureBlue) {
        const hasEnoughBlue = blueCount / labs.length >= minBlueFraction;
        const centerHasBlue = centers.some(c => {
          const lch = lchFromLabArr(c);
          return lch && lch.c > 5 && inHueRange(lch.h, blueHueRange[0], blueHueRange[1]);
        });

        if (hasEnoughBlue && !centerHasBlue) {
          let SL = 0, SA = 0, SB = 0, C = 0;
          for (const lab of labs) {
            const lch = lchFromLabArr(lab);
            if (lch && Number.isFinite(lch.h) && inHueRange(lch.h, blueHueRange[0], blueHueRange[1])) {
              SL += lab[0]; SA += lab[1]; SB += lab[2]; C++;
            }
          }
          if (C > 0) {
            const blueCentroid = [SL / C, SA / C, SB / C];
            let minC = Infinity, idx = 0;
            centers.forEach((c, i) => {
              const lch = lchFromLabArr(c);
              const cc = lch && Number.isFinite(lch.c) ? lch.c : 0;
              if (cc < minC) { minC = cc; idx = i; }
            });
            centers[idx] = blueCentroid;
          }
        }
      }

      const hexes = centers.map(labToHex);
      setLabCentroids(centers);
      setPalette(hexes);
      return hexes;
    } finally {
      setLoading(false);
    }
  }, [previewUrl]);

  return { extract, previewUrl, palette, labCentroids, loading };
}

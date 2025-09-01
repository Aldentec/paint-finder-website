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
  return toLch({ mode: "lab", l: L, a, b }); // h deg (NaN for gray), c≥0
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
      targetSamples = 30000, // hard cap
      maxStride = 8,         // never skip more than every 8th pixel
      // background filters
      ignoreWhites = true,
      ignoreBlacks = false,  // keep dark navies
      whiteThresh = 252,
      blackThresh = 5,
      // color filtering & clustering tweaks
      minChroma = 0,         // keep low-chroma dark colors
      chromaticBoost = 1.25, // >1 emphasizes a/b over L
      // blue handling
      ensureBlue = true,
      blueHueRange = [185, 275],
      blueDupes = 3,         // small duplication
      maxBlueDupes = 5000,
      minBlueFraction = 0.00002 // tiny fraction still triggers ensureBlue
    } = options;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // load
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

      // adaptive stride with an upper bound
      const totalPixels = w * h;
      const stride = Math.max(1, Math.min(Math.floor(totalPixels / targetSamples), maxStride));
      const inc = 4 * stride;

      const labs = [];
      const blueLabs = []; // keep blue samples separately for seeding
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

        const isBlue =
          ensureBlue && lch && Number.isFinite(lch.h) && inHueRange(lch.h, blueHueRange[0], blueHueRange[1]);

        if (isBlue) {
          blueLabs.push(lab);
          blueCount++;
          if (blueDupes > 1 && blueExtraAdded < maxBlueDupes) {
            const copies = Math.min(blueDupes - 1, maxBlueDupes - blueExtraAdded);
            for (let t = 0; t < copies; t++) labs.push(lab);
            blueExtraAdded += copies;
          }
        }
      }

      if (labs.length === 0) {
        setPalette([]); setLabCentroids([]); return [];
      }

      await new Promise((r) => setTimeout(r, 0)); // yield to UI

      // chroma emphasis for clustering
      const boosted = labs.map(([L, a, b]) => [L, a * chromaticBoost, b * chromaticBoost]);

      // ---- seed k-means with a blue centroid if we saw any blue ----
      let init = "kmeans++";
      if (ensureBlue && blueLabs.length > 0) {
        // mean of blue labs
        let SL = 0, SA = 0, SB = 0;
        for (const [L, a, b] of blueLabs) { SL += L; SA += a; SB += b; }
        const blueMean = [SL / blueLabs.length, SA / blueLabs.length, SB / blueLabs.length];
        const blueSeedBoosted = [blueMean[0], blueMean[1] * chromaticBoost, blueMean[2] * chromaticBoost];

        // choose k-1 random other seeds from boosted
        const seeds = [blueSeedBoosted];
        const seen = new Set();
        while (seeds.length < Math.min(k, boosted.length)) {
          const idx = (Math.random() * boosted.length) | 0;
          if (seen.has(idx)) continue;
          seen.add(idx);
          seeds.push(boosted[idx]);
        }
        init = seeds;
      }

      let km;
      try {
        km = kmeans(boosted, k, { initialization: init });
      } catch {
        // fallback if custom seeding fails for any reason
        km = kmeans(boosted, k, { initialization: "kmeans++" });
      }

      // unwrap & un-boost
      let centers = (km.centroids || [])
        .map(c => (Array.isArray(c) ? c : c?.centroid))
        .filter(c => Array.isArray(c) && c.length === 3)
        .map(([L, a, b]) => [L, a / chromaticBoost, b / chromaticBoost]);

      // ensureBlue fallback: inject blue centroid if missing
      if (ensureBlue) {
        const hasEnoughBlue = blueCount / labs.length >= minBlueFraction;
        const centerHasBlue = centers.some(c => {
          const lch = lchFromLabArr(c);
          return lch && lch.c > 2 && inHueRange(lch.h, blueHueRange[0], blueHueRange[1]); // lower chroma gate
        });

        if (hasEnoughBlue && !centerHasBlue && blueLabs.length > 0) {
          let SL = 0, SA = 0, SB = 0;
          for (const [L, a, b] of blueLabs) { SL += L; SA += a; SB += b; }
          const blueCentroid = [SL / blueLabs.length, SA / blueLabs.length, SB / blueLabs.length];

          // replace the most neutral centroid (smallest chroma)
          let minC = Infinity, idx = 0;
          centers.forEach((c, i) => {
            const lch = lchFromLabArr(c);
            const cc = lch && Number.isFinite(lch.c) ? lch.c : 0;
            if (cc < minC) { minC = cc; idx = i; }
          });
          centers[idx] = blueCentroid;
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

// src/usePalette.js
import { useState, useCallback } from "react";
import kmeans from "ml-kmeans";
import { converter, formatHex } from "culori";

const toLab = converter("lab");
const toRgb = converter("rgb");

/** Convert RGB [0-255] → Lab object {l,a,b} */
function rgb255ToLab(r, g, b) {
  const lab = toLab({ mode: "rgb", r: r / 255, g: g / 255, b: b / 255 });
  return lab && Number.isFinite(lab.l) ? [lab.l, lab.a, lab.b] : null;
}

/** Convert Lab array [L,a,b] → hex string */
function labToHex([L, a, b]) {
  const rgb = toRgb({ mode: "lab", l: L, a, b });
  if (!rgb) return "#000000";
  return formatHex(rgb).toUpperCase();
}

export default function usePalette() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [palette, setPalette] = useState([]);     // array of hexes
  const [labCentroids, setLabCentroids] = useState([]); // keep Lab too (optional)
  const [loading, setLoading] = useState(false);

  const extract = useCallback(async (file, k = 6, options = {}) => {
    setLoading(true);
    setPalette([]);
    setLabCentroids([]);

    const { ignoreWhites = true, ignoreBlacks = true, maxWidth = 512 } = options;

    // Preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

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
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);

    const { data } = ctx.getImageData(0, 0, w, h);

    // Collect Lab samples
    const labs = [];
    const step = 4; // skip every Nth pixel for speed (increase if too slow)
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 10) continue;

      // Optional: skip near-white/near-black to avoid background dominance
      if (ignoreWhites && r > 245 && g > 245 && b > 245) continue;
      if (ignoreBlacks && r < 10 && g < 10 && b < 10) continue;

      const lab = rgb255ToLab(r, g, b);
      if (lab) labs.push(lab);
    }

    // Safety: if no labs, bail
    if (labs.length === 0) {
      setLoading(false);
      return [];
    }

    // k-means in Lab
    const { centroids } = kmeans(labs, k, { initialization: "kmeans++" });
    const centers = centroids.map(c => c.centroid); // [[L,a,b], ...]

    const hexes = centers.map(labToHex);

    setLabCentroids(centers);
    setPalette(hexes);
    setLoading(false);
    return hexes;
  }, []);

  return { extract, previewUrl, palette, labCentroids, loading };
}

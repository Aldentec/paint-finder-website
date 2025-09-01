// src/components/PresetSelector.jsx
import React from "react";
import { PRESETS } from "../../utils/presets";

export default function PresetSelector({ value, onChange }) {
  return (
    <div role="group" aria-label="Mode" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {Object.entries(PRESETS).map(([key, meta]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          title={meta.desc}
          style={{
            padding:"8px 12px",
            borderRadius:10,
            border: value === key ? "1px solid #3b7bfd" : "1px solid #2a2e38",
            background: value === key ? "#1b2540" : "#111318",
            color:"#e7e7ea",
            cursor:"pointer"
          }}
        >
          {meta.label}
        </button>
      ))}
    </div>
  );
}

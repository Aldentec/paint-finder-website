// src/components/ShoppingList/ShoppingList.js
import React, { useState } from 'react';
import './ShoppingList.css';

const ShoppingList = ({ shoppingList }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!shoppingList.length) return null;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportList = () => {
    const text = shoppingList
      .map(paint => `${paint.name} - ${paint.range} (${paint.finish})`)
      .join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paint-shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="shopping-list">
      <div className="list-header">
        <h3 className="list-title">Shopping List</h3>
        <div className="list-actions">
          <span className="list-count">{shoppingList.length} paints</span>
          <button onClick={exportList} className="export-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="list-items">
        {shoppingList.map((paint, index) => (
          <div key={index} className="list-item">
            <div className="item-color" style={{ background: paint.hex }}></div>
            <div className="item-info">
              <div className="item-name">{paint.name}</div>
              <div className="item-details">
                {paint.range} • {paint.finish}
              </div>
            </div>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(paint.name, index)}
            >
              {copiedIndex === index ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;
// src/App.js
import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import PaintMatcher from './components/PaintMatcher/PaintMatcher';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <PaintMatcher />
      <Footer />
    </div>
  );
}

export default App;
// src/App.js
import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import HowItWorks from './components/HowItWorks/HowItWorks';
import PaintMatcher from './components/PaintMatcher/PaintMatcher';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <HowItWorks />
      <PaintMatcher />
      <Footer />
    </div>
  );
}

export default App;
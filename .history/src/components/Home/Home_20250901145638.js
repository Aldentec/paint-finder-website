// src/pages/HomePage.js
import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import PaintMatcher from '../components/PaintMatcher/PaintMatcher';
import Footer from '../components/Footer/Footer';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <PaintMatcher />
      <Footer />
    </div>
  );
};

export default HomePage;
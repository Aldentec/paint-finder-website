// src/pages/HomePage.js
import React from 'react';
import Header from '../Header/Header';
import Hero from '../Hero/Hero';
import PaintMatcher from '../PaintMatcher/PaintMatcher';
import Footer from '../Footer/Footer';

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
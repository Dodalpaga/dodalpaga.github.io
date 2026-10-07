'use client';
import React from 'react';
import NavBar from '@/components/navbar';
import Footer from '@/components/footer';
import Content from './content';
import './styles.css'; // Ensure the correct CSS file is imported

export default function App1() {
  return (
    <main className="chatbot-page">
      {/* Navbar */}
      <div className="chatbot-navigation">
        <NavBar />
      </div>

      {/* Main Content: Ensure it's aligned at the top */}
      <div className="chatbot-workspace">
        <Content />
      </div>

      {/* Footer */}
      <Footer brandName="Dorian Voydie" />
    </main>
  );
}

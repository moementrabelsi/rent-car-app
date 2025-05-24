import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  template: `
    <div class="about-hero">
      <div class="about-hero-bg"></div>
      <div class="about-hero-content">
        <h1>Drive Your Dreams</h1>
        <p class="subtitle">Experience freedom, comfort, and style with our premium car rental service.</p>
        <a class="cta-btn" routerLink="/cars">Start Your Journey</a>
      </div>
    </div>
    <div class="about-main">
      <section class="who-we-are">
        <h2>Who We Are</h2>
        <p>
          We are a passionate team of travel and technology enthusiasts, dedicated to making car rental simple, affordable, and enjoyable for everyone. Our mission is to connect people with the perfect vehicle for every journey, whether it’s a family vacation, a business trip, or a weekend getaway.
        </p>
        <div class="values-list">
          <div class="value-item">
            <span class="icon">🤝</span>
            <div>
              <h4>Customer First</h4>
              <p>Your satisfaction and safety are our top priorities.</p>
            </div>
          </div>
          <div class="value-item">
            <span class="icon">🚀</span>
            <div>
              <h4>Innovation</h4>
              <p>We embrace technology to make your experience seamless.</p>
            </div>
          </div>
          <div class="value-item">
            <span class="icon">🌍</span>
            <div>
              <h4>Sustainability</h4>
              <p>We care about the planet and offer eco-friendly options.</p>
            </div>
          </div>
        </div>
      </section>
      <section class="vision-mission">
        <h2>Our Vision & Mission</h2>
        <div class="vision-mission-cards">
          <div class="vm-card">
            <h4>Vision</h4>
            <p>To be the most trusted and innovative car rental platform, empowering people to explore the world with confidence and ease.</p>
          </div>
          <div class="vm-card">
            <h4>Mission</h4>
            <p>To deliver exceptional value and unforgettable journeys through top-quality vehicles, transparent pricing, and outstanding customer care.</p>
          </div>
        </div>
      </section>
      <h2>Why Choose Us?</h2>
      <div class="why-cards">
        <div class="why-card">
          <span class="icon">🚗</span>
          <h3>Wide Selection</h3>
          <p>From economy to luxury, find the perfect car for every trip and budget.</p>
        </div>
        <div class="why-card">
          <span class="icon">💸</span>
          <h3>Best Prices</h3>
          <p>Transparent pricing with no hidden fees. Enjoy affordable rates every day.</p>
        </div>
        <div class="why-card">
          <span class="icon">⏱️</span>
          <h3>Easy & Fast Booking</h3>
          <p>Book your car in minutes with our seamless and secure online process.</p>
        </div>
        <div class="why-card">
          <span class="icon">🌟</span>
          <h3>Trusted Service</h3>
          <p>Excellent customer support and top-rated vehicles for a worry-free ride.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-hero {
      position: relative;
      min-height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-bottom: 2.5rem;
    }
    .about-hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, #007bff 0%, #00c6ff 100%);
      opacity: 0.18;
      z-index: 1;
    }
    .about-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 3rem 1rem 2rem 1rem;
      width: 100%;
    }
    .about-hero h1 {
      font-size: 2.7rem;
      font-weight: 800;
      color: #007bff;
      margin-bottom: 0.7rem;
      letter-spacing: -1.5px;
    }
    .about-hero .subtitle {
      font-size: 1.3rem;
      color: #333;
      margin-bottom: 2rem;
      font-weight: 500;
    }
    .cta-btn {
      display: inline-block;
      background: #007bff;
      color: #fff;
      padding: 0.9rem 2.2rem;
      border-radius: 32px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 2px 10px rgba(0,123,255,0.08);
      transition: background 0.2s, box-shadow 0.2s;
      margin-top: 0.5rem;
    }
    .cta-btn:hover {
      background: #0056b3;
      box-shadow: 0 4px 16px rgba(0,123,255,0.16);
    }
    .about-main {
      max-width: 1100px;
      margin: 0 auto 3rem auto;
      padding: 0 1rem;
      text-align: center;
    }
    .about-main h2 {
      font-size: 2rem;
      color: #007bff;
      font-weight: 700;
      margin-bottom: 2rem;
    }
    .who-we-are {
      background: #f8fbff;
      border-radius: 18px;
      padding: 2.5rem 1.5rem 2rem 1.5rem;
      margin-bottom: 2.8rem;
      box-shadow: 0 2px 12px rgba(0,123,255,0.06);
    }
    .who-we-are h2 {
      color: #0056b3;
      margin-bottom: 1.2rem;
      font-size: 1.7rem;
    }
    .who-we-are p {
      color: #333;
      font-size: 1.13rem;
      margin-bottom: 2rem;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    .values-list {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      flex-wrap: wrap;
    }
    .value-item {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      padding: 1.1rem 1.3rem;
      min-width: 200px;
      max-width: 300px;
      margin-bottom: 1rem;
    }
    .value-item .icon {
      font-size: 2rem;
      color: #007bff;
      margin-top: 0.2rem;
    }
    .value-item h4 {
      margin: 0 0 0.3rem 0;
      color: #007bff;
      font-size: 1.09rem;
      font-weight: 700;
    }
    .value-item p {
      margin: 0;
      color: #444;
      font-size: 1rem;
    }
    .vision-mission {
      background: linear-gradient(90deg, #e3f0ff 0%, #f8fbff 100%);
      border-radius: 18px;
      padding: 2.2rem 1.5rem 2rem 1.5rem;
      margin-bottom: 2.8rem;
      box-shadow: 0 2px 12px rgba(0,123,255,0.04);
    }
    .vision-mission h2 {
      color: #0056b3;
      margin-bottom: 1.2rem;
      font-size: 1.5rem;
    }
    .vision-mission-cards {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      flex-wrap: wrap;
    }
    .vm-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      padding: 1.5rem 1.3rem;
      min-width: 220px;
      max-width: 340px;
      margin-bottom: 1rem;
    }
    .vm-card h4 {
      color: #007bff;
      font-size: 1.09rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    .vm-card p {
      color: #444;
      font-size: 1.04rem;
      margin: 0;
    }
    @media (max-width: 900px) {
      .values-list, .vision-mission-cards {
        flex-direction: column;
        gap: 1.2rem;
        align-items: center;
      }
    }
    .why-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      justify-content: center;
    }
    .why-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.07);
      padding: 2.2rem 1.5rem 1.5rem 1.5rem;
      width: 240px;
      min-width: 200px;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.16s, box-shadow 0.16s;
    }
    .why-card:hover {
      transform: translateY(-6px) scale(1.035);
      box-shadow: 0 6px 24px rgba(0,123,255,0.11);
    }
    .why-card .icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #007bff;
    }
    .why-card h3 {
      font-size: 1.18rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #222;
    }
    .why-card p {
      color: #555;
      font-size: 1.01rem;
      margin-bottom: 0;
    }
    @media (max-width: 900px) {
      .why-cards {
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
      }
      .about-hero h1 {
        font-size: 2.1rem;
      }
    }
  `]
})
export class AboutComponent {}
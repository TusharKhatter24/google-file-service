import React from 'react';
import ScrollAnimation from './ScrollAnimation';
import './SocialProof.css';

const testimonials = [
  {
    quote: 'AI Employees transformed how we handle customer support. Our response time improved by 70%.',
    author: 'Sarah Chen',
    role: 'CEO, TechStart Inc.',
    avatar: '👩‍💼',
  },
  {
    quote: 'The ability to train AI employees with our knowledge base has been a game-changer for our team.',
    author: 'Michael Rodriguez',
    role: 'CTO, InnovateCo',
    avatar: '👨‍💻',
  },
  {
    quote: 'We\'ve built a team of specialized AI employees that work seamlessly with our human team.',
    author: 'Emily Johnson',
    role: 'Founder, Growth Labs',
    avatar: '👩‍🚀',
  },
];


function SocialProof() {
  return (
    <section className="social-proof-section">
      <div className="social-proof-container">
        <ScrollAnimation>
          <h2 className="section-title">Trusted by Teams Who Work Fast</h2>
        </ScrollAnimation>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <ScrollAnimation key={index} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="testimonial-card">
              <div className="testimonial-quote">"{testimonial.quote}"</div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <div className="author-name">{testimonial.author}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialProof;


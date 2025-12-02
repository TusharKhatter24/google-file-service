import React from 'react';
import { motion } from 'framer-motion';
import { testimonials } from '../data/testimonials';
import './Testimonials.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

function Testimonials() {
  return (
    <motion.section 
      className="testimonials-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUp}
    >
      <div className="testimonials-container">
        <motion.div 
          className="testimonials-header"
          variants={fadeInUp}
        >
          <h2 className="testimonials-title">Helpers of the month, every month.</h2>
          <p className="testimonials-subtitle">
            With over 40,000 entrepreneurs from more than 100 countries, AI Concierges is the world's leading provider of business automation tools and AI-powered solutions.
          </p>
        </motion.div>
        
        <motion.div 
          className="testimonials-grid"
          variants={staggerContainer}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card"
              variants={staggerItem}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                rotateY: 2,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ 
                opacity: 1, 
                scale: 1,
                transition: { 
                  duration: 0.5,
                  delay: testimonial.id * 0.05
                }
              }}
              viewport={{ once: true }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-author-info">
                  <span className="testimonial-name">{testimonial.name}</span>
                  <span className="testimonial-location"> • {testimonial.location}</span>
                </div>
                <span className="testimonial-date">{testimonial.date}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Testimonials;


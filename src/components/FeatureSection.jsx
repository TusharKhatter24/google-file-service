import React from 'react';
import { motion } from 'framer-motion';
import './FeatureSection.css';

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

function FeatureSection({ title, subtitle, features, backgroundColor = 'var(--color-surface-elevated, #FFFFFF)' }) {
  return (
    <motion.section 
      className="feature-section"
      style={{ background: backgroundColor }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUp}
    >
      <div className="feature-section-container">
        <motion.div 
          className="feature-section-header"
          variants={fadeInUp}
        >
          <h2 className="feature-section-title">{title}</h2>
          {subtitle && (
            <p className="feature-section-subtitle">{subtitle}</p>
          )}
        </motion.div>

        <motion.div 
          className="feature-section-grid"
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-section-item"
              variants={staggerItem}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, rotateX: -15 }}
              whileInView={{ 
                opacity: 1, 
                rotateX: 0,
                transition: { 
                  duration: 0.6,
                  delay: index * 0.1
                }
              }}
              viewport={{ once: true }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="feature-section-icon">{feature.icon}</div>
              <h3 className="feature-section-item-title">{feature.title}</h3>
              <p className="feature-section-item-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default FeatureSection;


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQ.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const faqs = [
  {
    id: 1,
    question: 'What can I use AI Concierges for?',
    answer: 'AI Concierges is designed to boost productivity and simplify your business operations. You can use it for tasks like administrative work, lead generation, content creation, email outreach, social media management, project management, and much more. It\'s like having an AI Helper that completes your day-to-day tasks.'
  },
  {
    id: 2,
    question: 'Is there a money-back guarantee?',
    answer: 'Yes, we offer a money-back guarantee to ensure your satisfaction with AI Concierges. If you\'re not happy with the platform within the specified guarantee period, you can request a full refund.'
  },
  {
    id: 3,
    question: 'Can I invite my team to use AI Concierges?',
    answer: 'Absolutely! AI Concierges allows you to collaborate with your team by inviting them to the platform. You can work together seamlessly—all in one place. It\'s perfect for boosting team productivity and coordination.'
  },
  {
    id: 4,
    question: 'Does AI Concierges have an affiliate program?',
    answer: 'Yes, we offer an affiliate program where you can earn up to 50% commission for every sale made through your unique link.'
  },
  {
    id: 5,
    question: 'Are there tutorials or guides to help me use AI Concierges?',
    answer: 'Absolutely! We provide a variety of resources to help you make the most of AI Concierges, including detailed guides, case studies, and a Help Center. These materials are designed to guide you through using the platform effectively and answer any questions you may have.'
  },
  {
    id: 6,
    question: 'Can AI Concierges integrate with other software I use?',
    answer: 'Yes, AI Concierges integrates with many leading tools, such as Google Calendar, Notion, Facebook, Gmail and many more, and is also compatible with leading AI systems for seamless integration.'
  }
];

function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <motion.section 
      className="faq-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUp}
    >
      <div className="faq-container">
        <motion.div 
          className="faq-header"
          variants={fadeInUp}
        >
          <h2 className="faq-title">Questions? Let's clear things up.</h2>
          <p className="faq-subtitle">
            Yes, we understand—AI-powered solutions, business automation tools, AI for marketing, AI for customer support… a lot of big words can get confusing. We're here to make it clear—check out our FAQs, and if you still feel the need to ask questions, our AI employees are always ready to answer.
          </p>
        </motion.div>

        <div className="faq-list">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              className="faq-item"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
            >
              <motion.button
                className={`faq-question ${openId === faq.id ? 'open' : ''}`}
                onClick={() => toggleFAQ(faq.id)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{faq.question}</span>
                <motion.span 
                  className="faq-icon"
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openId === faq.id ? '−' : '+'}
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default FAQ;


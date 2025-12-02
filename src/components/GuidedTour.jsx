import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './GuidedTour.css';

function GuidedTour({ steps, isOpen, onClose, storageKey }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [spotlightRect, setSpotlightRect] = useState(null);
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);
  const currentElementRef = useRef(null);

  // Calculate tooltip position helper function
  const calculateTooltipPosition = useCallback((elementRect, scrollX, scrollY, step, tooltipWidth, tooltipHeight) => {
    const spacing = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 20; // Increased padding

    let top = 0;
    let left = 0;

    // Clamp tooltip dimensions to viewport
    const maxTooltipWidth = viewportWidth - (viewportPadding * 2);
    const maxTooltipHeight = viewportHeight - (viewportPadding * 2);
    tooltipWidth = Math.min(tooltipWidth, maxTooltipWidth);
    tooltipHeight = Math.min(tooltipHeight, maxTooltipHeight);

    // Determine position based on step.position preference
    const position = step.position || 'auto';

    // For fixed positioning, use viewport coordinates (elementRect is already in viewport coords)
    const elementTop = elementRect.top;
    const elementBottom = elementRect.bottom;
    const elementLeft = elementRect.left;
    const elementRight = elementRect.right;
    const elementCenterX = elementLeft + elementRect.width / 2;
    const elementCenterY = elementTop + elementRect.height / 2;

    // Calculate available space in each direction
    const spaceAbove = elementTop;
    const spaceBelow = viewportHeight - elementBottom;
    const spaceLeft = elementLeft;
    const spaceRight = viewportWidth - elementRight;

    // Smart positioning based on available space
    if (position === 'top' || (position === 'auto' && spaceAbove > spaceBelow && spaceAbove > tooltipHeight + spacing)) {
      // Position above
      top = Math.max(viewportPadding, elementTop - tooltipHeight - spacing);
      left = elementCenterX - tooltipWidth / 2;
    } else if (position === 'bottom' || (position === 'auto' && spaceBelow > tooltipHeight + spacing)) {
      // Position below
      top = elementBottom + spacing;
      left = elementCenterX - tooltipWidth / 2;
    } else if (position === 'left' || spaceLeft > spaceRight) {
      // Position to the left
      top = elementCenterY - tooltipHeight / 2;
      left = elementLeft - tooltipWidth - spacing;
      // If doesn't fit left, try right
      if (left < viewportPadding) {
        left = elementRight + spacing;
      }
    } else if (position === 'right' || spaceRight > tooltipWidth + spacing) {
      // Position to the right
      top = elementCenterY - tooltipHeight / 2;
      left = elementRight + spacing;
    } else {
      // Fallback: center in viewport
      top = Math.max(viewportPadding, (viewportHeight - tooltipHeight) / 2);
      left = Math.max(viewportPadding, (viewportWidth - tooltipWidth) / 2);
    }

    // Final viewport boundary checks - ensure tooltip stays within bounds
    left = Math.max(viewportPadding, Math.min(left, viewportWidth - tooltipWidth - viewportPadding));
    top = Math.max(viewportPadding, Math.min(top, viewportHeight - tooltipHeight - viewportPadding));

    setTooltipPosition({ top, left });
  }, []);

  // Check if tour was completed
  useEffect(() => {
    if (storageKey) {
      const completed = localStorage.getItem(`tour_completed_${storageKey}`);
      if (completed === 'true' && !isOpen) {
        // Tour was completed, don't auto-show
        return;
      }
    }
  }, [storageKey, isOpen]);

  // Handle step changes and element highlighting
  useEffect(() => {
    if (!isOpen || !steps || steps.length === 0) return;

    const step = steps[currentStep];
    if (!step) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const element = document.querySelector(step.target);
      
      if (element) {
        currentElementRef.current = element;
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Set spotlight position (using viewport coordinates for fixed positioning)
        setSpotlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        // Calculate initial position (will be refined after tooltip renders)
        // Use viewport coordinates (scrollX and scrollY are 0 for fixed positioning)
        // Use conservative estimates that fit within viewport
        const estimatedWidth = Math.min(320, window.innerWidth - 40);
        const estimatedHeight = Math.min(250, window.innerHeight - 40);
        calculateTooltipPosition(rect, 0, 0, step, estimatedWidth, estimatedHeight);

        // Wait for tooltip to render, then recalculate position based on actual dimensions
        setTimeout(() => {
          const tooltipElement = tooltipRef.current;
          if (tooltipElement) {
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const tooltipWidth = Math.min(tooltipRect.width || 320, window.innerWidth - 40);
            const tooltipHeight = Math.min(tooltipRect.height || 250, window.innerHeight - 40);
            
            // Recalculate with actual dimensions using viewport coordinates
            calculateTooltipPosition(rect, 0, 0, step, tooltipWidth, tooltipHeight);
          }
        }, 50);

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        console.warn(`Tour step target not found: ${step.target}`);
        // If element not found, try to continue to next step
        if (currentStep < steps.length - 1) {
          setTimeout(() => setCurrentStep(currentStep + 1), 500);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStep, isOpen, steps]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, steps]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      // Recalculate positions on resize or scroll
      const step = steps[currentStep];
      if (step) {
        const element = document.querySelector(step.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Use viewport coordinates for fixed positioning
          setSpotlightRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          
          // Recalculate tooltip position
          const tooltipElement = tooltipRef.current;
          if (tooltipElement) {
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const tooltipWidth = Math.min(tooltipRect.width || 320, window.innerWidth - 40);
            const tooltipHeight = Math.min(tooltipRect.height || 250, window.innerHeight - 40);
            calculateTooltipPosition(rect, 0, 0, step, tooltipWidth, tooltipHeight);
          } else {
            const estimatedWidth = Math.min(320, window.innerWidth - 40);
            const estimatedHeight = Math.min(250, window.innerHeight - 40);
            calculateTooltipPosition(rect, 0, 0, step, estimatedWidth, estimatedHeight);
          }
        }
      }
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isOpen, currentStep, steps, calculateTooltipPosition]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  }, [currentStep, steps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    // Mark tour as completed even when skipped
    if (storageKey) {
      localStorage.setItem(`tour_completed_${storageKey}`, 'true');
    }
    handleClose();
  }, [storageKey]);

  const handleFinish = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(`tour_completed_${storageKey}`, 'true');
    }
    handleClose();
  }, [storageKey]);

  const handleClose = useCallback(() => {
    // Mark tour as completed even when closed
    if (storageKey) {
      localStorage.setItem(`tour_completed_${storageKey}`, 'true');
    }
    setCurrentStep(0);
    setSpotlightRect(null);
    onClose();
  }, [onClose, storageKey]);

  if (!isOpen || !steps || steps.length === 0) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return createPortal(
    <div className="guided-tour-overlay" ref={overlayRef}>
      {/* Spotlight effect */}
      {spotlightRect && (
        <div
          className="guided-tour-spotlight"
          style={{
            top: `${spotlightRect.top}px`,
            left: `${spotlightRect.left}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="guided-tour-tooltip"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
      >
        <div className="guided-tour-tooltip-header">
          <h3 id="tour-title" className="guided-tour-tooltip-title">
            {step.title}
          </h3>
          <button
            className="guided-tour-close-btn"
            onClick={handleClose}
            aria-label="Close tour"
          >
            ×
          </button>
        </div>
        <p id="tour-description" className="guided-tour-tooltip-description">
          {step.description}
        </p>
        <div className="guided-tour-tooltip-footer">
          <div className="guided-tour-progress">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="guided-tour-actions">
            <button
              className="guided-tour-btn guided-tour-btn-secondary"
              onClick={handleSkip}
            >
              Skip Tour
            </button>
            <div className="guided-tour-nav-buttons">
              <button
                className="guided-tour-btn guided-tour-btn-secondary"
                onClick={handlePrevious}
                disabled={isFirstStep}
                aria-label="Previous step"
              >
                Previous
              </button>
              <button
                className="guided-tour-btn guided-tour-btn-primary"
                onClick={isLastStep ? handleFinish : handleNext}
                aria-label={isLastStep ? 'Finish tour' : 'Next step'}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default GuidedTour;


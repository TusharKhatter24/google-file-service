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

  // Calculate tooltip position helper function with comprehensive overflow detection
  const calculateTooltipPosition = useCallback((elementRect, scrollX, scrollY, step, tooltipWidth, tooltipHeight) => {
    const spacing = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 16;

    // For fixed positioning, use viewport coordinates (elementRect is already in viewport coords)
    const elementTop = elementRect.top;
    const elementBottom = elementRect.bottom;
    const elementLeft = elementRect.left;
    const elementRight = elementRect.right;
    const elementCenterX = elementLeft + elementRect.width / 2;
    const elementCenterY = elementTop + elementRect.height / 2;
    const elementWidth = elementRect.width;
    const elementHeight = elementRect.height;

    // Determine preferred position and fallback placements
    const preferredPosition = step.position || 'auto';
    let fallbackPlacements = [];

    if (preferredPosition === 'auto') {
      // For auto, try positions based on available space
      const spaceAbove = elementTop;
      const spaceBelow = viewportHeight - elementBottom;
      const spaceLeft = elementLeft;
      const spaceRight = viewportWidth - elementRight;

      // Determine best initial position based on available space
      const bestVertical = spaceBelow >= spaceAbove ? 'bottom' : 'top';
      const bestHorizontal = spaceRight >= spaceLeft ? 'right' : 'left';

      // If vertical space is better, prefer vertical placement
      if (Math.max(spaceAbove, spaceBelow) >= Math.max(spaceLeft, spaceRight)) {
        fallbackPlacements = [bestVertical, bestHorizontal, bestVertical === 'bottom' ? 'top' : 'bottom', bestHorizontal === 'right' ? 'left' : 'right'];
      } else {
        fallbackPlacements = [bestHorizontal, bestVertical, bestHorizontal === 'right' ? 'left' : 'right', bestVertical === 'bottom' ? 'top' : 'bottom'];
      }
    } else {
      // For explicit positions, try preferred first, then others
      const allPlacements = ['top', 'bottom', 'left', 'right'];
      fallbackPlacements = [preferredPosition, ...allPlacements.filter(p => p !== preferredPosition)];
    }

    // Helper function to check if a position fits within viewport
    const checkPositionFits = (placement) => {
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = elementTop - tooltipHeight - spacing;
          left = elementCenterX - tooltipWidth / 2;
          break;
        case 'bottom':
          top = elementBottom + spacing;
          left = elementCenterX - tooltipWidth / 2;
          break;
        case 'left':
          top = elementCenterY - tooltipHeight / 2;
          left = elementLeft - tooltipWidth - spacing;
          break;
        case 'right':
          top = elementCenterY - tooltipHeight / 2;
          left = elementRight + spacing;
          break;
        default:
          return null;
      }

      // Check if position fits with padding
      const tooltipRight = left + tooltipWidth;
      const tooltipBottom = top + tooltipHeight;

      const fitsHorizontally = left >= viewportPadding && tooltipRight <= viewportWidth - viewportPadding;
      const fitsVertically = top >= viewportPadding && tooltipBottom <= viewportHeight - viewportPadding;

      // Check if tooltip overlaps with element
      const overlapsElement = !(
        tooltipRight < elementLeft - spacing ||
        left > elementRight + spacing ||
        tooltipBottom < elementTop - spacing ||
        top > elementBottom + spacing
      );

      return {
        top,
        left,
        fits: fitsHorizontally && fitsVertically && !overlapsElement,
        overflow: {
          left: left < viewportPadding,
          right: tooltipRight > viewportWidth - viewportPadding,
          top: top < viewportPadding,
          bottom: tooltipBottom > viewportHeight - viewportPadding,
        },
      };
    };

    // Try each placement in order
    let bestPosition = null;
    for (const placement of fallbackPlacements) {
      const position = checkPositionFits(placement);
      if (position && position.fits) {
        bestPosition = position;
        break;
      }
      // Keep track of the best fit even if it doesn't fit perfectly
      if (position && !bestPosition) {
        bestPosition = position;
      }
    }

    // If we found a position, apply it with constraints
    if (bestPosition) {
      let { top, left } = bestPosition;

      // Apply constraints to ensure 16px padding from edges
      // Handle horizontal overflow
      if (left < viewportPadding) {
        left = viewportPadding;
      } else if (left + tooltipWidth > viewportWidth - viewportPadding) {
        left = Math.max(viewportPadding, viewportWidth - tooltipWidth - viewportPadding);
      }

      // Handle vertical overflow
      if (top < viewportPadding) {
        top = viewportPadding;
      } else if (top + tooltipHeight > viewportHeight - viewportPadding) {
        top = Math.max(viewportPadding, viewportHeight - tooltipHeight - viewportPadding);
      }

      // Handle edge case: tooltip is larger than viewport
      // Center it within available space
      if (tooltipWidth > viewportWidth - 2 * viewportPadding) {
        left = viewportPadding;
      }
      if (tooltipHeight > viewportHeight - 2 * viewportPadding) {
        top = viewportPadding;
      }

      setTooltipPosition({ top, left });
    } else {
      // Fallback: center tooltip in viewport if no position works
      const fallbackTop = Math.max(viewportPadding, (viewportHeight - tooltipHeight) / 2);
      const fallbackLeft = Math.max(viewportPadding, (viewportWidth - tooltipWidth) / 2);
      setTooltipPosition({ top: fallbackTop, left: fallbackLeft });
    }
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
        calculateTooltipPosition(rect, 0, 0, step, 320, 200);

        // Wait for tooltip to render, then recalculate position based on actual dimensions
        setTimeout(() => {
          const tooltipElement = tooltipRef.current;
          if (tooltipElement) {
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const tooltipWidth = tooltipRect.width || 320;
            const tooltipHeight = tooltipRect.height || 200;
            
            // Recalculate with actual dimensions using viewport coordinates
            calculateTooltipPosition(rect, 0, 0, step, tooltipWidth, tooltipHeight);
          }
        }, 100);

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
            const tooltipWidth = tooltipRect.width || 320;
            const tooltipHeight = tooltipRect.height || 200;
            calculateTooltipPosition(rect, 0, 0, step, tooltipWidth, tooltipHeight);
          } else {
            calculateTooltipPosition(rect, 0, 0, step, 320, 200);
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
    handleClose();
  }, []);

  const handleFinish = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(`tour_completed_${storageKey}`, 'true');
    }
    handleClose();
  }, [storageKey]);

  const handleClose = useCallback(() => {
    setCurrentStep(0);
    setSpotlightRect(null);
    onClose();
  }, [onClose]);

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


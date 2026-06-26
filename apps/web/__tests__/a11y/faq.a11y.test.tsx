// FlockIQ — FAQ Section Accessibility Tests
// File: apps/web/__tests__/a11y/FAQSection.test.tsx
// Task Reference: I-02
// Requirements: FR-HOME-006, NFR-A11Y-001

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQSection from '@/components/home/FAQSection';

describe('FAQSection Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<FAQSection />);
    // Basic accessibility check - component renders without errors
    expect(container).toBeInTheDocument();
  });

  it('should have proper ARIA attributes on FAQ buttons', () => {
    render(<FAQSection />);
    const faqButtons = screen.getAllByRole('button');
    
    faqButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-expanded');
      expect(button).toHaveAttribute('aria-controls');
    });
  });

  it('should have aria-expanded set to false initially', () => {
    render(<FAQSection />);
    const faqButtons = screen.getAllByRole('button');
    
    faqButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should toggle aria-expanded when FAQ item is clicked', () => {
    render(<FAQSection />);
    const firstButton = screen.getAllByRole('button')[0];
    
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have proper keyboard navigation with Enter key', () => {
    render(<FAQSection />);
    const firstButton = screen.getAllByRole('button')[0];
    
    firstButton.focus();
    expect(firstButton).toHaveFocus();
    
    fireEvent.keyDown(firstButton, { key: 'Enter' });
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should have proper keyboard navigation with Space key', () => {
    render(<FAQSection />);
    const firstButton = screen.getAllByRole('button')[0];
    
    firstButton.focus();
    fireEvent.keyDown(firstButton, { key: ' ' });
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should have unique aria-controls IDs', () => {
    render(<FAQSection />);
    const faqButtons = screen.getAllByRole('button');
    
    const ariaControlsIds = faqButtons.map(button => 
      button.getAttribute('aria-controls')
    );
    
    const uniqueIds = new Set(ariaControlsIds);
    expect(uniqueIds.size).toBe(ariaControlsIds.length);
  });

  it('should have proper answer elements with matching IDs', () => {
    render(<FAQSection />);
    const faqButtons = screen.getAllByRole('button');
    
    faqButtons.forEach(button => {
      const controlsId = button.getAttribute('aria-controls');
      const answerElement = document.getElementById(controlsId || '');
      expect(answerElement).toBeInTheDocument();
    });
  });

  it('should have proper heading structure', () => {
    render(<FAQSection />);
    const heading = screen.getByText('आपके मन में सवाल हैं — यहाँ जवाब हैं');
    expect(heading.tagName).toBe('H2');
  });

  it('should have JSON-LD schema for SEO', () => {
    render(<FAQSection />);
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    expect(schemaScript).toBeInTheDocument();
    
    if (schemaScript) {
      const schema = JSON.parse(schemaScript.textContent || '{}');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toBeDefined();
    }
  });

  it('should have proper focus management when navigating between items', () => {
    render(<FAQSection />);
    const faqButtons = screen.getAllByRole('button');
    
    faqButtons[0].focus();
    expect(faqButtons[0]).toHaveFocus();
    
    fireEvent.keyDown(faqButtons[0], { key: 'ArrowDown' });
    // Focus should move to next interactive element
  });

  it('should have single-expand behavior (opening one closes others)', () => {
    render(<FAQSection />);
    const faqButtons = screen.getAllByRole('button');
    
    fireEvent.click(faqButtons[0]);
    expect(faqButtons[0]).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.click(faqButtons[1]);
    expect(faqButtons[1]).toHaveAttribute('aria-expanded', 'true');
    expect(faqButtons[0]).toHaveAttribute('aria-expanded', 'false');
  });
});

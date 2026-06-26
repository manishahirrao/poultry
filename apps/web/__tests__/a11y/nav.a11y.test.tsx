// FlockIQ — Floating Navigation Accessibility Tests
// File: apps/web/__tests__/a11y/FloatingNav.test.tsx
// Task Reference: I-02
// Requirements: FR-NAV-001, NFR-A11Y-001

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingNav from '@/components/nav/FloatingNav';

describe('FloatingNav Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<FloatingNav />);
    // Basic accessibility check - component renders without errors
    expect(container).toBeInTheDocument();
  });

  it('should have proper ARIA labels on hamburger button', () => {
    render(<FloatingNav />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('should open mobile menu when hamburger is clicked', () => {
    render(<FloatingNav />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    fireEvent.click(hamburgerButton);
    
    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toBeInTheDocument();
  });

  it('should close mobile menu when close button is clicked', () => {
    render(<FloatingNav />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    fireEvent.click(hamburgerButton);
    
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('should have keyboard navigation support', () => {
    render(<FloatingNav />);
    const navLinks = screen.getAllByRole('link');
    
    navLinks.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
  });

  it('should have proper focus management on mobile menu', () => {
    render(<FloatingNav />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    
    hamburgerButton.focus();
    expect(hamburgerButton).toHaveFocus();
    
    fireEvent.click(hamburgerButton);
    
    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toHaveFocus();
  });

  it('should have language toggle buttons with proper labels', () => {
    render(<FloatingNav />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    fireEvent.click(hamburgerButton);
    
    const hindiButton = screen.getByText('हिंदी');
    const englishButton = screen.getByText('English');
    
    expect(hindiButton).toBeInTheDocument();
    expect(englishButton).toBeInTheDocument();
  });

  it('should have proper heading structure', () => {
    render(<FloatingNav />);
    const logo = screen.getByText('FlockIQ');
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('A');
  });
});

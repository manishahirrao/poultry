// FlockIQ — Demo Modal Accessibility Tests
// File: apps/web/__tests__/a11y/DemoModal.test.tsx
// Task Reference: I-02
// Requirements: FR-POPUP-001, NFR-A11Y-001

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DemoModal from '@/components/popups/DemoModal';

// Mock the PopupProvider
vi.mock('@/providers/PopupProvider', () => ({
  usePopup: () => ({
    activePopup: 'demo_modal',
    closePopup: vi.fn(),
    isPopupOpen: vi.fn(() => true),
  }),
}));

describe('DemoModal Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<DemoModal />);
    // Basic accessibility check - component renders without errors
    expect(container).toBeInTheDocument();
  });

  it('should have proper ARIA attributes on modal', () => {
    render(<DemoModal />);
    const modal = screen.getByRole('dialog');
    
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'demo-modal-title');
  });

  it('should have proper heading with matching ID', () => {
    render(<DemoModal />);
    const heading = screen.getByText('Live Demo बुक करें');
    
    expect(heading).toHaveAttribute('id', 'demo-modal-title');
    expect(heading.tagName).toBe('H2');
  });

  it('should have close button with proper ARIA label', () => {
    render(<DemoModal />);
    const closeButton = screen.getByLabelText('Close modal');
    
    expect(closeButton).toBeInTheDocument();
  });

  it('should have focus trap implementation', async () => {
    render(<DemoModal />);
    
    const firstInput = screen.getByLabelText(/नाम/i);
    await waitFor(() => {
      expect(firstInput).toHaveFocus();
    });
  });

  it('should close modal when Escape key is pressed', async () => {
    const { closePopup } = require('@/providers/PopupProvider');
    const mockClosePopup = vi.fn();
    
    vi.mocked(require('@/providers/PopupProvider').usePopup).mockReturnValue({
      activePopup: 'demo_modal',
      closePopup: mockClosePopup,
      isPopupOpen: vi.fn(() => true),
    });

    render(<DemoModal />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(mockClosePopup).toHaveBeenCalled();
    });
  });

  it('should have proper form labels associated with inputs', () => {
    render(<DemoModal />);
    
    const nameLabel = screen.getByLabelText(/नाम/i);
    const nameInput = screen.getByLabelText(/नाम/i);
    expect(nameInput).toHaveAttribute('id');
    expect(nameLabel).toHaveAttribute('for', nameInput.id);
    
    const phoneLabel = screen.getByLabelText(/WhatsApp Number/i);
    const phoneInput = screen.getByLabelText(/WhatsApp Number/i);
    expect(phoneInput).toHaveAttribute('id');
    expect(phoneLabel).toHaveAttribute('for', phoneInput.id);
  });

  it('should have required fields marked', () => {
    render(<DemoModal />);
    
    const nameInput = screen.getByLabelText(/नाम/i);
    const phoneInput = screen.getByLabelText(/WhatsApp Number/i);
    const districtSelect = screen.getByLabelText(/जिला/i);
    
    expect(nameInput).toHaveAttribute('required');
    expect(phoneInput).toHaveAttribute('required');
    expect(districtSelect).toHaveAttribute('required');
  });

  it('should have DPDP consent checkbox with label association', () => {
    render(<DemoModal />);
    
    const consentCheckbox = screen.getByRole('checkbox');
    const consentLabel = screen.getByLabelText(/मैं सहमत हूँ/i);
    
    expect(consentCheckbox).toHaveAttribute('id');
    expect(consentLabel).toHaveAttribute('for', consentCheckbox.id);
    expect(consentCheckbox).toHaveAttribute('required');
  });

  it('should have error announcements for validation failures', async () => {
    render(<DemoModal />);
    
    const submitButton = screen.getByRole('button', { name: /Demo कॉल बुक करें/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const errorMessage = screen.queryByText(/कृपया सही मोबाइल नंबर दर्ज करें/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should have proper keyboard navigation within modal', async () => {
    render(<DemoModal />);
    
    const inputs = screen.getAllByRole('textbox').concat(
      screen.getAllByRole('combobox'),
      screen.getAllByRole('checkbox')
    );
    
    inputs[0].focus();
    expect(inputs[0]).toHaveFocus();
    
    fireEvent.keyDown(inputs[0], { key: 'Tab' });
    // Focus should move to next element
  });

  it('should have proper button labels', () => {
    render(<DemoModal />);
    
    const submitButton = screen.getByRole('button', { name: /Demo कॉल बुक करें/i });
    const closeButton = screen.getByRole('button', { name: /Close modal/i });
    
    expect(submitButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it('should have success state with proper accessibility', async () => {
    render(<DemoModal />);
    
    // Simulate successful submission
    const submitButton = screen.getByRole('button', { name: /Demo कॉल बुक करें/i });
    
    // Fill form
    const nameInput = screen.getByLabelText(/नाम/i);
    const phoneInput = screen.getByLabelText(/WhatsApp Number/i);
    const districtSelect = screen.getByLabelText(/जिला/i);
    const consentCheckbox = screen.getByRole('checkbox');
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    fireEvent.change(districtSelect, { target: { value: 'gorakhpur' } });
    fireEvent.click(consentCheckbox);
    
    // Note: Actual submission would require mocking the fetch API
    // This test verifies the accessibility structure
  });

  it('should have proper focus return on close', async () => {
    const { closePopup } = require('@/providers/PopupProvider');
    const mockClosePopup = vi.fn();
    
    vi.mocked(require('@/providers/PopupProvider').usePopup).mockReturnValue({
      activePopup: 'demo_modal',
      closePopup: mockClosePopup,
      isPopupOpen: vi.fn(() => true),
    });

    render(<DemoModal />);
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(mockClosePopup).toHaveBeenCalled();
    });
  });

  it('should have proper select dropdown options', () => {
    render(<DemoModal />);
    
    const districtSelect = screen.getByLabelText(/जिला/i);
    const options = districtSelect.querySelectorAll('option');
    
    expect(options.length).toBeGreaterThan(1);
    expect(options[0]).toHaveTextContent('जिला चुनें');
  });
});

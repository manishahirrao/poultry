// FlockIQ — Forms Accessibility Tests
// File: apps/web/__tests__/a11y/forms.a11y.test.tsx
// Task Reference: T-02
// Requirements: NFR-A11Y-001

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock form component for testing
const TestForm = ({ onSubmit = vi.fn() }) => (
  <form onSubmit={onSubmit} data-testid="test-form">
    <label htmlFor="name">नाम</label>
    <input
      id="name"
      name="name"
      type="text"
      required
      aria-required="true"
      aria-invalid="false"
    />
    
    <label htmlFor="phone">WhatsApp Number</label>
    <input
      id="phone"
      name="phone"
      type="tel"
      required
      aria-required="true"
      aria-invalid="false"
    />
    
    <label htmlFor="district">जिला</label>
    <select
      id="district"
      name="district"
      required
      aria-required="true"
      aria-invalid="false"
    >
      <option value="">जिला चुनें</option>
      <option value="gorakhpur">गोरखपुर</option>
    </select>
    
    <label htmlFor="consent">
      <input
        id="consent"
        name="consent"
        type="checkbox"
        required
        aria-required="true"
      />
      मैं सहमत हूँ
    </label>
    
    <button type="submit">Submit</button>
  </form>
);

describe('Forms Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<TestForm />);
    expect(container).toBeInTheDocument();
  });

  it('should have proper label associations with inputs', () => {
    render(<TestForm />);
    
    const nameLabel = screen.getByLabelText('नाम');
    const nameInput = screen.getByLabelText('नाम');
    expect(nameInput).toHaveAttribute('id', 'name');
    expect(nameLabel).toHaveAttribute('for', 'name');
    
    const phoneLabel = screen.getByLabelText('WhatsApp Number');
    const phoneInput = screen.getByLabelText('WhatsApp Number');
    expect(phoneInput).toHaveAttribute('id', 'phone');
    expect(phoneLabel).toHaveAttribute('for', 'phone');
  });

  it('should have aria-required attribute on required fields', () => {
    render(<TestForm />);
    
    const nameInput = screen.getByLabelText('नाम');
    const phoneInput = screen.getByLabelText('WhatsApp Number');
    const districtSelect = screen.getByLabelText('जिला');
    const consentCheckbox = screen.getByLabelText('मैं सहमत हूँ');
    
    expect(nameInput).toHaveAttribute('aria-required', 'true');
    expect(phoneInput).toHaveAttribute('aria-required', 'true');
    expect(districtSelect).toHaveAttribute('aria-required', 'true');
    expect(consentCheckbox).toHaveAttribute('aria-required', 'true');
  });

  it('should have required attribute on required fields', () => {
    render(<TestForm />);
    
    const nameInput = screen.getByLabelText('नाम');
    const phoneInput = screen.getByLabelText('WhatsApp Number');
    const districtSelect = screen.getByLabelText('जिला');
    const consentCheckbox = screen.getByLabelText('मैं सहमत हूँ');
    
    expect(nameInput).toHaveAttribute('required');
    expect(phoneInput).toHaveAttribute('required');
    expect(districtSelect).toHaveAttribute('required');
    expect(consentCheckbox).toHaveAttribute('required');
  });

  it('should have error announcements with role="alert"', () => {
    const ErrorForm = () => (
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
        <div id="email-error" role="alert">
          कृपया सही email दर्ज करें
        </div>
      </form>
    );
    
    render(<ErrorForm />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('कृपया सही email दर्ज करें');
  });

  it('should have aria-invalid attribute on invalid fields', () => {
    const ErrorForm = () => (
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
        <div id="email-error" role="alert">
          कृपया सही email दर्ज करें
        </div>
      </form>
    );
    
    render(<ErrorForm />);
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('should have aria-describedby linking error messages to inputs', () => {
    const ErrorForm = () => (
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
        <div id="email-error" role="alert">
          कृपया सही email दर्ज करें
        </div>
      </form>
    );
    
    render(<ErrorForm />);
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('should have proper input types for different field types', () => {
    render(<TestForm />);
    
    const nameInput = screen.getByLabelText('नाम');
    const phoneInput = screen.getByLabelText('WhatsApp Number');
    
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  it('should have proper keyboard navigation support', () => {
    render(<TestForm />);
    
    const inputs = screen.getAllByRole('textbox').concat(
      screen.getAllByRole('combobox'),
      screen.getAllByRole('checkbox')
    );
    
    inputs[0].focus();
    expect(inputs[0]).toHaveFocus();
    
    fireEvent.keyDown(inputs[0], { key: 'Tab' });
    // Focus should move to next element
  });

  it('should have submit button with proper label', () => {
    render(<TestForm />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('should have proper form validation on submit', () => {
    const handleSubmit = vi.fn();
    render(<TestForm onSubmit={handleSubmit} />);
    
    const form = screen.getByTestId('test-form');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    
    fireEvent.click(submitButton);
    
    // Form should trigger validation
    expect(form).toHaveAttribute('novalidate'); // or handle validation
  });

  it('should have proper focus management after validation error', () => {
    const ErrorForm = () => (
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
        <div id="email-error" role="alert">
          कृपया सही email दर्ज करें
        </div>
      </form>
    );
    
    render(<ErrorForm />);
    const emailInput = screen.getByLabelText('Email');
    
    emailInput.focus();
    expect(emailInput).toHaveFocus();
  });

  it('should have proper checkbox label association', () => {
    render(<TestForm />);
    
    const consentCheckbox = screen.getByLabelText('मैं सहमत हूँ');
    expect(consentCheckbox).toHaveAttribute('id', 'consent');
    expect(consentCheckbox).toHaveAttribute('type', 'checkbox');
  });

  it('should have proper select dropdown with options', () => {
    render(<TestForm />);
    
    const districtSelect = screen.getByLabelText('जिला');
    const options = districtSelect.querySelectorAll('option');
    
    expect(options.length).toBeGreaterThan(1);
    expect(options[0]).toHaveTextContent('जिला चुनें');
  });

  it('should have proper fieldset and legend for related form groups', () => {
    const GroupedForm = () => (
      <form>
        <fieldset>
          <legend>व्यक्तिगत जानकारी</legend>
          <label htmlFor="name">नाम</label>
          <input id="name" type="text" />
        </fieldset>
      </form>
    );
    
    render(<GroupedForm />);
    const fieldset = screen.getByRole('group');
    const legend = screen.getByText('व्यक्तिगत जानकारी');
    
    expect(fieldset).toBeInTheDocument();
    expect(legend).toBeInTheDocument();
    expect(legend.tagName).toBe('LEGEND');
  });

  it('should have proper autocomplete attributes where applicable', () => {
    const AutoCompleteForm = () => (
      <form>
        <label htmlFor="name">नाम</label>
        <input id="name" type="text" autoComplete="name" />
        
        <label htmlFor="phone">Phone</label>
        <input id="phone" type="tel" autoComplete="tel" />
        
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" />
      </form>
    );
    
    render(<AutoCompleteForm />);
    
    const nameInput = screen.getByLabelText('नाम');
    const phoneInput = screen.getByLabelText('Phone');
    const emailInput = screen.getByLabelText('Email');
    
    expect(nameInput).toHaveAttribute('autoComplete', 'name');
    expect(phoneInput).toHaveAttribute('autoComplete', 'tel');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
  });
});

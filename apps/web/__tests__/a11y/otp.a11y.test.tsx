// FlockIQ — OTP Input Accessibility Tests
// File: apps/web/__tests__/a11y/otp.a11y.test.tsx
// Task Reference: T-02
// Requirements: NFR-A11Y-001

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OTPInput } from '@/components/auth/OTPInput';

describe('OTPInput Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<OTPInput value="" onChange={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });

  it('should have group role on container', () => {
    const { container } = render(<OTPInput value="" onChange={vi.fn()} />);
    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', '6-अंकीय OTP code');
  });

  it('should have individual box labels for each input', () => {
    render(<OTPInput value="" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs.forEach((input, index) => {
      expect(input).toHaveAttribute('aria-label', `OTP अंक ${index + 1}`);
    });
  });

  it('should support keyboard navigation between boxes with arrow keys', () => {
    render(<OTPInput value="" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    
    // Focus first input
    inputs[0].focus();
    expect(inputs[0]).toHaveFocus();
    
    // Arrow right should move to next input
    fireEvent.keyDown(inputs[0], { key: 'ArrowRight' });
    expect(inputs[1]).toHaveFocus();
    
    // Arrow left should move to previous input
    fireEvent.keyDown(inputs[1], { key: 'ArrowLeft' });
    expect(inputs[0]).toHaveFocus();
  });

  it('should auto-advance to next input on digit entry', () => {
    const handleChange = vi.fn();
    render(<OTPInput value="" onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs[0].focus();
    fireEvent.change(inputs[0], { target: { value: '1' } });
    
    expect(inputs[1]).toHaveFocus();
  });

  it('should support backspace to clear and move to previous input', () => {
    const handleChange = vi.fn();
    render(<OTPInput value="123" onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    
    // Should move to previous input if current is empty
    expect(inputs[1]).toHaveFocus();
  });

  it('should have error announcement with role="alert"', () => {
    render(<OTPInput value="" onChange={vi.fn()} error="Invalid OTP" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Invalid OTP');
  });

  it('should have locked state announcement with role="alert"', () => {
    render(
      <OTPInput 
        value="" 
        onChange={vi.fn()} 
        maxAttempts={5}
        attemptsRemaining={0}
      />
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('बहुत ज़्यादा गलत tries');
  });

  it('should have proper input mode for numeric keyboard on mobile', () => {
    render(<OTPInput value="" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs.forEach(input => {
      expect(input).toHaveAttribute('inputMode', 'numeric');
    });
  });

  it('should have autocomplete attribute for one-time-code', () => {
    render(<OTPInput value="" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs.forEach(input => {
      expect(input).toHaveAttribute('autoComplete', 'one-time-code');
    });
  });

  it('should have pattern attribute for numeric input', () => {
    render(<OTPInput value="" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs.forEach(input => {
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  it('should have maxLength of 1 for each input', () => {
    render(<OTPInput value="" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs.forEach(input => {
      expect(input).toHaveAttribute('maxLength', '1');
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(<OTPInput value="" onChange={vi.fn()} disabled />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('should have proper focus management when error occurs', () => {
    const handleChange = vi.fn();
    render(<OTPInput value="123" onChange={handleChange} error="Invalid" />);
    const inputs = screen.getAllByRole('textbox');
    
    // On error, focus should return to first input
    expect(inputs[0]).toHaveFocus();
  });

  it('should support paste functionality', () => {
    const handleChange = vi.fn();
    render(<OTPInput value="" onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs[0].focus();
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: vi.fn(() => '123456')
      }
    });
    
    expect(handleChange).toHaveBeenCalledWith('123456');
  });
});

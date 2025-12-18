import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastContainer } from './Toast';
import * as ToastContext from '@/contexts/ToastContext';

vi.mock('@/contexts/ToastContext');

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no toasts', () => {
    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [],
      removeToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders toast with message', () => {
    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [{ id: 1, message: 'Test message', type: 'info' }],
      removeToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [{ id: 1, message: 'Error', type: 'error' }],
      removeToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });

  it('renders success toast', () => {
    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [{ id: 1, message: 'Success', type: 'success' }],
      removeToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [
        { id: 1, message: 'First', type: 'info' },
        { id: 2, message: 'Second', type: 'error' },
        { id: 3, message: 'Third', type: 'success' },
      ],
      removeToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });

  it('renders icons for different toast types', () => {
    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [{ id: 1, message: 'Test', type: 'info' }],
      removeToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

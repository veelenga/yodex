import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;

  describe('useToast hook', () => {
    it('throws error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within ToastProvider');

      consoleError.mockRestore();
    });

    it('provides toast functions when used within ToastProvider', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      expect(result.current.showToast).toBeDefined();
      expect(result.current.showError).toBeDefined();
      expect(result.current.showSuccess).toBeDefined();
      expect(result.current.showInfo).toBeDefined();
      expect(result.current.removeToast).toBeDefined();
      expect(result.current.toasts).toEqual([]);
    });
  });

  describe('showToast', () => {
    it('adds a toast to the list', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Test message', 'info');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test message');
      expect(result.current.toasts[0].type).toBe('info');
    });

    it('generates unique IDs for toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Message 1', 'info');
      });

      // Advance time slightly to ensure different timestamp
      act(() => {
        vi.advanceTimersByTime(1);
      });

      act(() => {
        result.current.showToast('Message 2', 'info');
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
    });

    it('removes toast after timeout', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Test message', 'info');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('defaults to info type when type not specified', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.toasts[0].type).toBe('info');
    });
  });

  describe('showError', () => {
    it('adds an error toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showError('Error message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Error message');
      expect(result.current.toasts[0].type).toBe('error');
    });
  });

  describe('showSuccess', () => {
    it('adds a success toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showSuccess('Success message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Success message');
      expect(result.current.toasts[0].type).toBe('success');
    });
  });

  describe('showInfo', () => {
    it('adds an info toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showInfo('Info message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Info message');
      expect(result.current.toasts[0].type).toBe('info');
    });
  });

  describe('removeToast', () => {
    it('removes specific toast by ID', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId;

      act(() => {
        result.current.showToast('Message 1', 'info');
      });

      act(() => {
        vi.advanceTimersByTime(1);
      });

      act(() => {
        result.current.showToast('Message 2', 'info');
      });

      toastId = result.current.toasts[0].id;

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Message 2');
    });

    it('does nothing when removing non-existent toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Message 1', 'info');
      });

      act(() => {
        result.current.removeToast(999999);
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('multiple toasts', () => {
    it('handles multiple toasts simultaneously', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showError('Error');
        result.current.showSuccess('Success');
        result.current.showInfo('Info');
      });

      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts[0].type).toBe('error');
      expect(result.current.toasts[1].type).toBe('success');
      expect(result.current.toasts[2].type).toBe('info');
    });

    it('maintains correct order when adding toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('First', 'info');
        result.current.showToast('Second', 'info');
        result.current.showToast('Third', 'info');
      });

      expect(result.current.toasts[0].message).toBe('First');
      expect(result.current.toasts[1].message).toBe('Second');
      expect(result.current.toasts[2].message).toBe('Third');
    });
  });
});

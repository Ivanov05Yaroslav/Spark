import { toast as coolToast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    coolToast.success(message, {
      ...defaultOptions,
      icon: () => '✅',
      className: 'toast-bg-success',
      progressClassName: 'toast-progress-success',
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    coolToast.error(message, {
      ...defaultOptions,
      icon: () => '❌',
      className: 'toast-bg-error',
      progressClassName: 'toast-progress-error',
      ...options,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    coolToast.info(message, {
      ...defaultOptions,
      icon: () => 'ℹ️',
      className: 'toast-bg-info',
      progressClassName: 'toast-progress-info',
      ...options,
    });
  },
};

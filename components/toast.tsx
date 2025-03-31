// components/Toast.tsx
'use client';
import { toast, ToastContainer, ToastOptions, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define default options for the toast
const defaultOptions: ToastOptions = {
  position: 'top-right',
  theme: 'dark',
  autoClose: 3000, // auto close after 3 seconds (adjust as needed)
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  icon: false,
  transition: Slide,
};

// Helper function to trigger a toast
export const notify = (
  message: string,
  type: 'info' | 'success' | 'warning' | 'error'
) => {
  toast(message, { ...defaultOptions, type });
};

// Toast container to be placed once in your app (typically at a high level)
export default function Toast() {
  return <ToastContainer {...defaultOptions} />;
}

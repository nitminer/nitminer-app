'use client';

import { useRouter } from 'next/navigation';
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface TrustInnAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessType: 'not_logged_in' | 'no_trials' | 'premium_required' | 'success';
  userEmail?: string;
  remainingTrials?: number;
}

export default function TrustInnAccessModal({
  isOpen,
  onClose,
  accessType,
  userEmail,
  remainingTrials,
}: TrustInnAccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const getModalContent = () => {
    switch (accessType) {
      case 'not_logged_in':
        return {
          icon: <FiAlertCircle className="w-16 h-16 text-yellow-500" />,
          title: 'Not Logged In',
          description: 'Please log in to access TrustInn. Sign in with your account to continue.',
          buttons: [
            {
              label: 'Login',
              onClick: () => {
                onClose();
                router.push('/login');
              },
              variant: 'primary',
            },
            {
              label: 'Cancel',
              onClick: onClose,
              variant: 'secondary',
            },
          ],
        };

      case 'no_trials':
        return {
          icon: <FiAlertCircle className="w-16 h-16 text-red-500" />,
          title: 'No Free Credits Left',
          description: `You have used all your free credits. Upgrade to premium to continue using TrustInn and get unlimited access.`,
          buttons: [
            {
              label: 'Upgrade to Premium',
              onClick: () => {
                onClose();
                router.push('/pricing');
              },
              variant: 'primary',
            },
            {
              label: 'Cancel',
              onClick: onClose,
              variant: 'secondary',
            },
          ],
        };

      case 'premium_required':
        return {
          icon: <FiAlertCircle className="w-16 h-16 text-blue-500" />,
          title: 'Premium Feature',
          description: `TrustInn requires a premium subscription. You currently have ${remainingTrials || 0} free credits left. Upgrade now to enjoy unlimited access.`,
          buttons: [
            {
              label: 'View Pricing',
              onClick: () => {
                onClose();
                router.push('/pricing');
              },
              variant: 'primary',
            },
            {
              label: 'Use Free Credit',
              onClick: onClose,
              variant: 'secondary',
            },
          ],
        };

      case 'success':
        return {
          icon: <FiCheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Access Granted',
          description: 'You have access to TrustInn. Redirecting now...',
          buttons: [],
        };

      default:
        return {
          icon: <FiAlertCircle className="w-16 h-16 text-gray-500" />,
          title: 'Error',
          description: 'An error occurred. Please try again.',
          buttons: [
            {
              label: 'Close',
              onClick: onClose,
              variant: 'secondary',
            },
          ],
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
        >
          <FiX size={24} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">{content.icon}</div>

          {/* Title */}
          <h3
            className="text-2xl font-black text-gray-900 dark:text-white mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            {content.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed">
            {content.description}
          </p>

          {/* User Email Info */}
          {userEmail && accessType !== 'not_logged_in' && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Logged in as: <span className="font-bold">{userEmail}</span>
              </p>
            </div>
          )}

          {/* Buttons */}
          {content.buttons.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              {content.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                    button.variant === 'primary'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

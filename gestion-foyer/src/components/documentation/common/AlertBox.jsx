import React from 'react';
import { 
  InformationCircleIcon, 
  ExclamationIcon, 
  CheckCircleIcon 
} from '@heroicons/react/outline';

const alertTypes = {
  info: {
    icon: InformationCircleIcon,
    light: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-800',
      text: 'text-blue-700',
      iconColor: 'text-blue-600'
    },
    dark: {
      bg: 'bg-blue-900/30',
      border: 'border-blue-800',
      title: 'text-blue-300',
      text: 'text-blue-200',
      iconColor: 'text-blue-400'
    }
  },
  warning: {
    icon: ExclamationIcon,
    light: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: 'text-amber-800',
      text: 'text-amber-700',
      iconColor: 'text-amber-600'
    },
    dark: {
      bg: 'bg-amber-900/30',
      border: 'border-amber-800',
      title: 'text-amber-300',
      text: 'text-amber-200',
      iconColor: 'text-amber-400'
    }
  },
  success: {
    icon: CheckCircleIcon,
    light: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'text-green-800',
      text: 'text-green-700',
      iconColor: 'text-green-600'
    },
    dark: {
      bg: 'bg-green-900/30',
      border: 'border-green-800',
      title: 'text-green-300',
      text: 'text-green-200',
      iconColor: 'text-green-400'
    }
  }
};

const AlertBox = ({ 
  type = 'info',
  title, 
  children,
  colorMode
}) => {
  const alertConfig = alertTypes[type];
  const styles = colorMode === 'dark' ? alertConfig.dark : alertConfig.light;
  const Icon = alertConfig.icon;

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border} mb-6`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          )}
          <div className={`mt-2 text-sm ${styles.text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;
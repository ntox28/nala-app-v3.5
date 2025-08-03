import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../../hooks/useToast';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import ExclamationCircleIcon from '../icons/ExclamationCircleIcon';
import XCircleIcon from '../icons/XCircleIcon';

interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: number) => void;
}

const toastConfig = {
    success: {
        icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
        bg: 'bg-green-500/10 border-green-500/20',
    },
    error: {
        icon: <ExclamationCircleIcon className="w-6 h-6 text-red-400" />,
        bg: 'bg-red-500/10 border-red-500/20',
    },
    info: {
        icon: <ExclamationCircleIcon className="w-6 h-6 text-sky-400" />,
        bg: 'bg-sky-500/10 border-sky-500/20',
    },
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleRemove();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        setIsFadingOut(true);
        setTimeout(() => onRemove(toast.id), 300); // Wait for fade-out animation
    };

    const config = toastConfig[toast.type];

    return (
        <div
            className={`toast-item ${isFadingOut ? 'fade-out' : 'fade-in'} w-full max-w-sm overflow-hidden rounded-lg shadow-lg bg-slate-800 border ${config.bg} flex items-center`}
        >
            <div className="p-4">
                {config.icon}
            </div>
            <div className="flex-1 p-4">
                <p className="text-sm text-slate-200">{toast.message}</p>
            </div>
            <button onClick={handleRemove} className="p-4 text-slate-500 hover:text-white transition-colors">
                <XCircleIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;

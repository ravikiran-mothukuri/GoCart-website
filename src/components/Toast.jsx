// Toast.jsx - Reusable Toast Notification Component
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={20} className="shrink-0" />,
        error: <XCircle size={20} className="shrink-0" />,
        info: <Info size={20} className="shrink-0" />,
        warning: <AlertCircle size={20} className="shrink-0" />
    };

    const styles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white',
        warning: 'bg-orange-600 text-white'
    };

    return (
        <div
            className={`fixed left-1/2 top-24 z-[9999] flex min-w-[280px] max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl backdrop-blur-sm transition-all sm:left-auto sm:right-6 sm:top-28 sm:min-w-[320px] sm:translate-x-0 ${styles[type]}`}
            role="alert"
            aria-live="polite"
        >
            {icons[type]}
            <span className="flex-1 text-sm font-medium sm:text-base">{message}</span>
        </div>
    );
};

export default Toast;

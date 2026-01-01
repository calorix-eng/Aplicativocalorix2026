import React, { useEffect, useState } from 'react';

interface ToastProps {
    toast: { message: string; id: number } | null;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (toast) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                // Allow time for fade-out animation before calling onClose
                setTimeout(onClose, 300);
            }, 3000); // Toast visible for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    if (!toast) {
        return null;
    }

    return (
        <div 
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            {toast.message}
        </div>
    );
};

export default Toast;
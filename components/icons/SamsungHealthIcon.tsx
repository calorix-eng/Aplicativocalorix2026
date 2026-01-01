
import React from 'react';

export const SamsungHealthIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className || "w-8 h-8"} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="10" fill="#E60023"/>
        <path d="M12 6V18M7 11L12 6L17 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

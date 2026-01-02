
import React from 'react';

interface ThumbsDownIconProps {
    filled?: boolean;
    className?: string;
}

export const ThumbsDownIcon: React.FC<ThumbsDownIconProps> = ({ filled = false, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "h-5 w-5"}
        viewBox="0 0 20 20" 
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
    >
        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2h-5.416a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.438 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.466a4 4 0 00.8-2.4z" />
    </svg>
);

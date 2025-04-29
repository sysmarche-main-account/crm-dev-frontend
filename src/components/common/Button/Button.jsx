import React from 'react';

const Button = ({ onClick, children, type = "button", className = "", disabled = false }) => {
    return (
        <button 
            type={type} 
            className={`btn ${className}`} 
            onClick={onClick} 
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;

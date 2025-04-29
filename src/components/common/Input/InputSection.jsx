import React from 'react';

const Input = ({ label, name, value, onChange, type = "text", className = "", placeholder = "", error }) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={name}>{label}</label>}
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                className={error ? "input-error" : ""}
            />
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default Input;

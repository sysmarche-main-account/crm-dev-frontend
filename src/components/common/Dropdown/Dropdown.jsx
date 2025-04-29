import React from 'react';

const Dropdown = ({ label, options, value, onChange, className = "", error }) => {
    return (
        <div className={`dropdown ${className}`}>
            {label && <label>{label}</label>}
            <select value={value} onChange={onChange} className={error ? "dropdown-error" : ""}>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default Dropdown;

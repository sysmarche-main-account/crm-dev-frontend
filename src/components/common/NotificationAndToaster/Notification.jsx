import React from 'react';

const Notification = ({ message, type = "info", onClose }) => {
    return (
        <div className={`notification ${type}`}>
            <p>{message}</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default Notification;

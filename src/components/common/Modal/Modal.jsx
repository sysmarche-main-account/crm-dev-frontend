"use client";
import React, { useState } from 'react';
import CloseIcon from "@/images/close-icon.svg";
import './Modal.scss';
import { CircularProgress } from '@mui/material';

const Modal = ({ isOpen, onClose, title, subtitle, icon: IconComponent, content, actions }) => {
  const [loadingStates, setLoadingStates] = useState(
    actions.map(() => false) // Initialize loading state for each action as false
  );

  if (!isOpen) return null;

  const handleActionClick = async (index, action) => {
    setLoadingStates((prevStates) =>
      prevStates.map((isLoading, i) => (i === index ? true : isLoading))
    );
  
    try {
      await action.onClick?.(); // Await the async operation
    } finally {
      setLoadingStates((prevStates) =>
        prevStates.map((isLoading, i) => (i === index ? false : isLoading))
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          {/* Render the icon if provided */}
          {IconComponent && <IconComponent className="modal-icon" />}  
          <div className='modal-header-content'>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
            <span className='content'>{content}</span>
            <div className="modal-actions">
              {actions.map((action, index) => (
                <button 
                id={`modal-btn-${action?.label}`}
                key={index} 
                className={action.className}
                onClick={() => handleActionClick(index, action)} 
                // onClick={action.onClick}
                >
                  {/* {action.label} */}
                  {loadingStates[index] ? <CircularProgress size={20} color='#000' /> : action.label}
                </button>
              ))}
        </div>
          </div>
          <button id="modal-close-btn" onClick={onClose} className="close-button"><CloseIcon/></button>
        </div>
        <div className="modal-body">
          {/* {content} */}
        </div>
        {/* <div className="modal-actions">
          {actions.map((action, index) => (
            <button key={index} className={action.className} onClick={action.onClick}>
              {action.label}
            </button>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default Modal;

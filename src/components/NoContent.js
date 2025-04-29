"use client";
import React from "react";
import PropTypes from "prop-types";
// import "@/styles/ManageRoles.scss";

const NoContent = ({
  illustration: Illustration,
  title,
  subtitle,
  buttonText,
  onButtonClick,
  buttonClassName = "create-role-btn",
  buttonText2,
  onButtonClick2,
  children,
}) => {
  return (
    <>
      <div className="content">
        <div className="illustration">{Illustration && <Illustration />}</div>
        <p className="message-title">{title}</p>
        <p className="message-subtitle">{subtitle}</p>
        {buttonText && onButtonClick && (
          <button
            id={`no-content-${buttonText}`}
            className={buttonClassName}
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        )}
        {buttonText2 && onButtonClick2 && (
          <button
            id={`no-content-${buttonText2}`}
            style={{ marginTop: 5 }}
            className={buttonClassName}
            onClick={onButtonClick2}
          >
            {buttonText2}
          </button>
        )}
      </div>
      {children}
    </>
  );
};

NoContent.propTypes = {
  illustration: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  buttonClassName: PropTypes.string,
  buttonText2: PropTypes.string,
  onButtonClick2: PropTypes.func,
  children: PropTypes.node,
};

export default NoContent;

// How we can use this in another component presenting as a demo
// {
//   <NoContent
//     illustration={EmptyRoles}
//     title={t('nocontent.no_role_title')}
//     subtitle={t('nocontent.no_role_subtitle')}
//     buttonText={t('nocontent.create_role_button')}
//     onButtonClick={openModal}
// >
//     <CreateRoleModal open={isModalOpen} onClose={closeModal} />
// </NoContent>
// }

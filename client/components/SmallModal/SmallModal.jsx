import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

const SmallModal = (props) => {
  return (
    <Modal
      size="sm"
      dialogClassName="custom-modal"
      show="true"
      onHide={() => props.setShow(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.children}</Modal.Body>
    </Modal>
  );
};

SmallModal.propTypes = {
  setShow: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.node.isRequired,
  ]),
  children: PropTypes.node.isRequired,
};

export default SmallModal;

import React from 'react';
import { Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const Loader = (props) => {
  if (props.isLoading) {
    return (
      <div className="default-spinner">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return props.children;
};

Loader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default Loader;

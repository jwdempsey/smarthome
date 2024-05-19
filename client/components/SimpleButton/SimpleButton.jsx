import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import service from '../../service';

const Toggle = (props) => {
  const handleClick = () => {
    service.notify({ ...{ command: props.command, value: '1' } });
  };

  return (
    <Form.Group as={Row}>
      <Col xs="5">
        <Form.Label>
          {props.children} {props.command}
        </Form.Label>
      </Col>
      <Col xs="7">
        <Button
          variant="primary"
          size="sm"
          onClick={handleClick}
        >
          Enable
        </Button>
      </Col>
    </Form.Group>
  );
};

Toggle.propTypes = {
  title: PropTypes.string.isRequired,
  device: PropTypes.object.isRequired,
  command: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default Toggle;

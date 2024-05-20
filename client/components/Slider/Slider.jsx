import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import service from '../../service';

const Slider = (props) => {
  const [value, setValue] = useState(100);
  const timeout = useRef();

  useEffect(() => {
    if (hasOwnProperty.call(props.device.properties, 'brightness')) {
      setValue(props.device.properties.brightness);
    } else {
      setValue(100);
    }
  }, []);

  const handleChange = (e) => {
    clearTimeout(timeout.current);

    const target = e.currentTarget.value;
    setValue(target);

    // debouncing so we don't hit the API too often
    timeout.current = setTimeout(() => {
      service.notify({
        ...props.device,
        ...{ command: props.title, value: target },
      });
    }, 500);
  };

  return (
    <Form.Group as={Row}>
      <Col xs="4">
        <Form.Label>{props.title}</Form.Label>
      </Col>
      <Col xs="4">
        <Form.Control
          className="slider-value"
          type="text"
          placeholder="100"
          value={value}
          disabled={true}
        />
      </Col>
      <Col xs="12">
        {props.children}
        <Form.Range
          min="0"
          max="100"
          step="1"
          id="brightness-slider"
          value={value}
          onChange={handleChange}
        />
      </Col>
    </Form.Group>
  );
};

Slider.propTypes = {
  title: PropTypes.string.isRequired,
  device: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default Slider;

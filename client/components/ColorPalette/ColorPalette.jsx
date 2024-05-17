import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import service from '../../service';

const ColorPalette = (props) => {
  const [value, setValue] = useState('#000000');
  const timeout = useRef();

  useEffect(() => {
    const color = props.device.properties.color;
    setValue(rgbToHex(color.r, color.g, color.b));
  }, []);

  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  const handleChange = (e) => {
    clearTimeout(timeout.current);

    const target = e.currentTarget.value;
    setValue(target);

    // debouncing so we don't hit the API too often
    timeout.current = setTimeout(() => {
      service.notify({
        ...props.device,
        ...{ command: 'color', value: target },
      });
    }, 500);
  };

  return (
    <Form.Group as={Row}>
      <Col xs="12">
        <Form.Label>{props.title}</Form.Label>
      </Col>
      <Col xs="1">{props.children}</Col>
      <Col xs="11">
        <Form.Control
          type="color"
          id="color-picker"
          title="Choose your color"
          defaultValue={value}
          onChange={handleChange}
        />
      </Col>
    </Form.Group>
  );
};

ColorPalette.propTypes = {
  title: PropTypes.string.isRequired,
  device: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default ColorPalette;

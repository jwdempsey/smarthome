import React, { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import service from "../../service";

const Toggle = (props) => {
  const [value, setValue] = useState(false);

  useEffect(() => {
    props.device.properties.powerState === "on"
      ? setValue(true)
      : setValue(false);
  }, []);

  const handleChange = (e) => {
    const target = e.currentTarget.checked;
    service.notify({ ...props.device, ...{ command: "power", value: target } });
    setValue(target);
  };

  return (
    <Form.Group as={Row}>
      <Col xs="9">
        <Form.Label>
          {props.children} {props.title}
        </Form.Label>
      </Col>
      <Col xs="3">
        <Form.Check
          type="switch"
          id="power-switch"
          checked={value}
          onChange={handleChange}
        />
      </Col>
    </Form.Group>
  );
};

Toggle.propTypes = {
  title: PropTypes.string.isRequired,
  device: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default Toggle;

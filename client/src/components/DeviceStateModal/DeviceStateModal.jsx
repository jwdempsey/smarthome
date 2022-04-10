import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import SmallModal from "../SmallModal";
import DynamicInput from "../DynamicInput";
import Loader from "../Loader";
import service from "../../service";
import Header from "../Header";

const DeviceStateModal = (props) => {
  const [device, setDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    service.getDevice(props.device).then((data) => {
      setDevice(data[0]);
      setIsLoading(false);
    });
  }, []);

  return (
    <SmallModal
      title={<Header icon="gear">Settings</Header>}
      setShow={props.setShow}
    >
      <Loader isLoading={isLoading}>
        <Form className="form">
          {device &&
            device.commands &&
            device.commands.map((command) => (
              <DynamicInput
                key={command}
                command={command}
                title={props.device.name}
                device={device}
              />
            ))}
        </Form>
      </Loader>
    </SmallModal>
  );
};

DeviceStateModal.propTypes = {
  device: PropTypes.object.isRequired,
  setShow: PropTypes.func.isRequired,
};

export default DeviceStateModal;

import React, { useState, useContext } from "react";
import { Container, Col, Card } from "react-bootstrap";
import PropTypes from "prop-types";
import DeviceStateModal from "../DeviceStateModal";
import DynamicButton from "../DynamicButton";
import service from "../../service";
import Header from "../Header/Header";
import { TypeContext } from "../../contexts/TypeContext";

const DeviceCard = (props) => {
  const [show, setShow] = useState(false);
  const [types] = useContext(TypeContext);

  const handleModalClick = (event) => {
    event.preventDefault();
    setShow(true);
  };

  const handleButtonClick = (setButtonState, device, value) => {
    return service
      .notify({ ...device, ...{ command: "power", value: value } })
      .then(() => {
        setButtonState("success");
      })
      .catch(() => {
        setButtonState("failure");
      });
  };

  return (
    <>
      {show ? (
        <DeviceStateModal setShow={setShow} device={props.device} />
      ) : null}

      <Col md="auto">
        <Card style={{ width: "12rem" }} className="shadow-sm">
          <Card.Body>
            <Card.Title>
              <Header>
                <i className={`bi-${types[props.device.type].icon}`} />
                {props.device.name}
              </Header>
            </Card.Title>
            <Container className="buttons">
              <DynamicButton
                variant="outline-success"
                text="On"
                handleClick={handleButtonClick}
                item={props.device}
                value={true}
              />
              <DynamicButton
                variant="outline-secondary"
                text="Off"
                handleClick={handleButtonClick}
                item={props.device}
                value={false}
              />
            </Container>
            <Card.Link
              onClick={handleModalClick}
              href="#"
              className="stretched-link"
            />
          </Card.Body>
        </Card>
      </Col>
    </>
  );
};

DeviceCard.propTypes = {
  device: PropTypes.object.isRequired,
};

export default DeviceCard;

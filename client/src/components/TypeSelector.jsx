import React, { useContext } from "react";
import { Navbar, Offcanvas, ListGroup } from "react-bootstrap";
import { TypeContext } from "../contexts/TypeContext";
import ListItem from "./ListItem";

const TypeSelctor = () => {
  const [types] = useContext(TypeContext);

  return (
    <>
      <Navbar.Toggle aria-controls="offcanvasNavbar" />
      <Navbar.Offcanvas
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="offcanvasNavbarLabel">Types</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup variant="flush">
            {Object.keys(types).map((key) => (
              <ListItem
                key={key}
                value={key}
                icon={`bi-${types[key].icon}`}
                name={types[key].name}
              />
            ))}
            <ListItem key="" value="" icon="bi-collection" name="All" />
          </ListGroup>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </>
  );
};

export default TypeSelctor;

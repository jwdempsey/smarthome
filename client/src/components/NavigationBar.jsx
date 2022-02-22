import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { HouseDoor } from "react-bootstrap-icons";
import TypeSelctor from "./TypeSelector";

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand={false}>
      <Container fluid>
        <Navbar.Brand href="#home">
          <HouseDoor size={18} color="white" /> Smart Home
        </Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="#settings">Settings</Nav.Link>
          <Nav.Link href="#logs">Logs</Nav.Link>
        </Nav>
        <TypeSelctor />
      </Container>
    </Navbar>
  );
};

export default NavigationBar;

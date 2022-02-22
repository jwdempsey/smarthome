import React from "react";
import NavigationBar from "./components/NavigationBar";
import Devices from "./components/Devices";
import { TypeProvider } from "./contexts/TypeContext";
import "./App.scss";

const App = () => {
  return (
    <TypeProvider>
      <NavigationBar />
      <Devices />
    </TypeProvider>
  );
};

export default App;

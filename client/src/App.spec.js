import { act } from "react-dom/test-utils";
import App from "./App";
import { TypeContext } from "./contexts/TypeContext";

describe("App Component", () => {
  it("renders NavigationBar Component", async () => {
    await act(async () => {
      global.root.render(<App />);
    });

    expect(global.container.textContent).toContain("Smart Home");
  });

  it("renders Devices Component", async () => {
    await act(async () => {
      global.root.render(<App />);
    });

    expect(global.container.querySelector("#grid")).toBeTruthy();
  });
});

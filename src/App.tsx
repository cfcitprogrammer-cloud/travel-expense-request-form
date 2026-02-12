import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ApplicationPage from "./components/pages/application";

function App() {
  const [count, setCount] = useState(0);

  return (
    <section className="font-display">
      <ApplicationPage />
    </section>
  );
}

export default App;

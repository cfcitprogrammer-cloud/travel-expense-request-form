import { Toaster } from "sonner";
import "./App.css";
import ApplicationPage from "./components/pages/application";

function App() {
  return (
    <section className="font-display">
      <ApplicationPage />
      <Toaster />
    </section>
  );
}

export default App;

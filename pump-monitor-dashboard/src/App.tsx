import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { PumpDetails } from "./pages/PumpDetails";
import { Alerts } from "./pages/Alerts";
import { Analytics } from "./pages/Analytics";
import { Planner } from "./pages/Planner";
import { Insights } from "./pages/Insights";
import { FailureIntelligence } from "./pages/FailureIntelligence";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pumps" element={<PumpDetails />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="planner" element={<Planner />} />
          <Route path="insights" element={<Insights />} />
          <Route path="failure-intelligence" element={<FailureIntelligence />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

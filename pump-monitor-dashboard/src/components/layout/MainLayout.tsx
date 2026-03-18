import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AICopilot } from "../../modules/copilot/AICopilot";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 pr-14">
        <Outlet />
      </main>
      <AICopilot />
    </div>
  );
}

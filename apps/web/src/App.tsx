import { Boxes, Database } from "lucide-react";
import { Link as RouterLink, Route, Routes } from "react-router-dom";
import { ContractDetailPage } from "./pages/ContractDetailPage";
import { ContractsPage } from "./pages/ContractsPage";
import { ProtocolDetailPage } from "./pages/ProtocolDetailPage";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <RouterLink to="/" className="brand">
          <Boxes size={24} aria-hidden="true" />
          <span>Contract Explorer</span>
        </RouterLink>
        <nav className="topnav" aria-label="Primary">
          <RouterLink to="/" className="nav-link">
            <Database size={17} aria-hidden="true" />
            Contracts
          </RouterLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<ContractsPage />} />
          <Route path="/contracts/:chainSlug/:address" element={<ContractDetailPage />} />
          <Route path="/protocols/:slug" element={<ProtocolDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

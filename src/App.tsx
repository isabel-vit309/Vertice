import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { RegistrationDraftProvider } from "./services/registrationDraft";
import SessionGuard from "./components/SessionGuard";

export default function App() {
  return (
    <BrowserRouter>
      <RegistrationDraftProvider>
        <AppRoutes />
        <SessionGuard />
      </RegistrationDraftProvider>
    </BrowserRouter>
  );
}

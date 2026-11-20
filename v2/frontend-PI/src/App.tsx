import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { RegistrationDraftProvider } from "./services/registrationDraft";

export default function App() {
  return (
    <BrowserRouter>
      <RegistrationDraftProvider>
        <AppRoutes />
      </RegistrationDraftProvider>
    </BrowserRouter>
  );
}

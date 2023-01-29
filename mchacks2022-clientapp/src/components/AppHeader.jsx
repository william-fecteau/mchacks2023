import { Icon } from "@iconify/react";
import LoginModal from "./LoginModal";
import { useState } from "react";

export default function AppHeader() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <nav
        style={{ fontFamily: "Poppins" }}
        className="font-semibold text-2xl flex justify-between align-middle p-4"
      >
        <div>
          Commun<span className="text-primary">EAT</span>y
        </div>
        <div
          className="text-navGreen text-base cursor-pointer hover:text-primary"
          onClick={() => setShowLoginModal(true)}
        >
          <Icon icon="material-symbols:login" className="inline mr-1" />
          Login
        </div>
      </nav>
      <LoginModal show={showLoginModal} setShow={setShowLoginModal} />
    </>
  );
}

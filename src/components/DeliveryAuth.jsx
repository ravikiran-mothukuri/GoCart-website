import { useState } from "react";
import PartnerLogin from "../delivery/PartnerLogin";
import PartnerRegister from "../delivery/PartnerRegister";

export default function DeliveryAuth() {
  const [screen, setScreen] = useState("login");

  return (
    <>
      {screen === "login" ? (
        <PartnerLogin onSwitch={setScreen} />
      ) : (
        <PartnerRegister onSwitch={setScreen} />
      )}
    </>
  );
}

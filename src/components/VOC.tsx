import React from "react";

import { useService } from "../hooks";

import { locked, unlocked, power } from "./Icon";
import { ButtonGrid } from "./Atoms";
import { ActionButton, ServiceBox } from "./Molecules";

export const VOC: React.FC = () => {
  const [data] = useService<VOCServiceData>("voc");

  return (
    <ServiceBox title="Volvo" type="icons">
      {data && (
        <ButtonGrid>
          <ActionButton
            id="locked"
            active={data.locked === undefined ? false : !data.locked}
          >
            {data.locked ? locked : unlocked}
          </ActionButton>
          <ActionButton id="running" active={!!data.running}>
            {power}
          </ActionButton>
        </ButtonGrid>
      )}
    </ServiceBox>
  );
};

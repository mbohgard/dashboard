import React from "react";

import { useService } from "../hooks";

import { Icon } from "./Icon";
import { ButtonGrid } from "./Atoms";
import { ActionButton, ServiceBox } from "./Molecules";

export const VOC: React.FC = () => {
  const [data] = useService<VOCServiceData>("voc");

  return (
    <ServiceBox title={data?.label} type="icons">
      {data && (
        <ButtonGrid>
          <ActionButton
            id="locked"
            active={data.locked === undefined ? false : !data.locked}
          >
            {data.locked ? <Icon LockLocked /> : <Icon LockUnlocked />}
          </ActionButton>
          <ActionButton id="running" active={!!data.running}>
            <Icon Power />
          </ActionButton>
        </ButtonGrid>
      )}
    </ServiceBox>
  );
};

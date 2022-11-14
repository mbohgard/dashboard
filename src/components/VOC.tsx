import React from "react";

import { useService } from "../hooks";

import { Icon } from "./Icon";
import { ButtonGrid } from "./Atoms";
import { ActionButton, ServiceBox } from "./Molecules";
import { colors } from "../styles";

const getChargeColor = (value?: number) => {
  if (value === undefined) return;

  return value < 40 ? colors.red : value < 90 ? colors.orange : colors.green;
};

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
          <ActionButton
            color={getChargeColor(data.batteryLevel)}
            coloredBorder
            id="battery"
            active
            pulse={data.charging}
          >
            <span>{data.batteryLevel}%</span>
          </ActionButton>
        </ButtonGrid>
      )}
    </ServiceBox>
  );
};

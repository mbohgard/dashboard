import React from "react";

import { useService } from "../hooks";

import { car, locked, unlocked, power } from "./Icon";
import { ActionButton, DimmedIconBox as Box, ButtonGrid } from "./Atoms";

export const VOC: React.FC = () => {
  const [data] = useService<VOCServiceData>("voc");

  return (
    <Box>
      {car}
      {data && (
        <ButtonGrid>
          <ActionButton
            active={data.locked === undefined ? false : !data.locked}
          >
            {data.locked ? locked : unlocked}
          </ActionButton>
          <ActionButton active={!!data.running}>{power}</ActionButton>
        </ButtonGrid>
      )}
    </Box>
  );
};

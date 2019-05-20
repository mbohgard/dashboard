import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { CommonProps } from "../main";

import { car, locked, unlocked, power } from "./Icon";
import { ActionButton, DimmedIconBox as Box, ButtonGrid } from "./Atoms";

const Buttons = styled(ButtonGrid)`
  grid-template-columns: auto;
`;

export const VOC: React.SFC<CommonProps> = ({ reportError, socket }) => {
  const [data, setData] = useState<Partial<VOCData>>({});

  useEffect(() => {
    const listener = (res: VOCServiceData) =>
      res.data ? setData(res.data) : reportError(res.service, res.error);

    socket.on("voc", listener);

    return () => {
      socket.off("voc", listener);
    };
  }, []);

  return (
    <Box>
      {car}
      {data && (
        <Buttons>
          <ActionButton
            active={data.locked === undefined ? false : !data.locked}
          >
            {data.locked ? locked : unlocked}
          </ActionButton>
          <ActionButton active={!!data.running}>{power}</ActionButton>
        </Buttons>
      )}
    </Box>
  );
};

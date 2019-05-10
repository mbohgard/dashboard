import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import tinycolor from "tinycolor2";

import { colors } from "../styles";
import { CommonProps } from "../main";

import { volvo, locked, unlocked, power } from "./Icon";

const Container = styled.div`
  display: grid;
  grid-gap: 36px;
  grid-template-rows: 1fr 1fr;
  position: relative;
  margin-bottom: 25px;
  width: 160px;

  > svg {
    position: absolute;
    width: 160px;
    height: 160px;
    top: -24px;
    z-index: -1;

    path {
      fill: ${colors.ultraDimmed};
    }
  }
`;

const Item = styled.div<{ active?: boolean }>`
  text-align: center;

  svg {
    width: 36px;
    height: 36px;

    path {
      fill: ${({ active }) => (active ? colors.white : colors.superDimmed)};
    }
  }
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

  console.log(data);

  return (
    <Container>
      {volvo}
      {data && (
        <>
          <Item active={!data.locked}>{data.locked ? locked : unlocked}</Item>
          <Item active={data.running}>{power}</Item>
        </>
      )}
    </Container>
  );
};

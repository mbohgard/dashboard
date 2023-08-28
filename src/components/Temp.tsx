import React from "react";
import styled from "styled-components";

import { useService } from "../hooks";
import { getTempColor } from "../utils/color";
import { Icon } from "./Icon";
import { Loader } from "./Atoms";

const Container = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
  height: 100%;
  gap: 10px;
  margin-bottom: 15px;
`;

const Item = styled.li`
  display: flex;
  font-size: 22px;
  text-transform: uppercase;
  gap: 8px;
  align-items: flex-end;

  > svg path {
    fill: currentColor;
  }
`;

const Degrees = styled.span`
  display: block;
  text-align: right;
  margin-top: 0.3em;
  font-size: 1.5em;
  font-weight: 300;
`;

export const Temp = () => {
  const [tempData] = useService<TempServiceData>("temp", {});
  const [groups] = useService<HueServiceData>("hue", {});

  if (!tempData || !groups) return <Loader />;

  return (
    <Container>
      {Object.entries(tempData).map(([id, { name, value }]) => {
        const deg = Math.round(value / 10) / 10;
        const color = getTempColor(deg, [5, 35]);
        const icon = Object.values(groups).find((o) => o.name === name)?.class;

        return (
          <Item key={id} style={{ color }}>
            {icon ? <Icon hueClass={icon} size={36} /> : `${name}:`}
            <Degrees>{deg}</Degrees>
          </Item>
        );
      })}
    </Container>
  );
};

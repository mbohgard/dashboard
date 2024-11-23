import React from "react";
import styled from "styled-components";

import { useConfig } from "../../../hooks";
import { getTempColor } from "../../../utils/color";
import { Icon } from "../../../components/Icon";
import { Loader } from "../../../components/Atoms";
import { ServiceBox } from "../../../components/Molecules";
import { useService } from "../../../hooks/useService";

const Container = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
  height: 100%;
  gap: 16px;
`;

const Item = styled.li`
  display: flex;
  font-size: 24px;
  text-transform: uppercase;
  gap: 8px;

  > svg path {
    fill: currentColor;
  }
`;

const Degrees = styled.span`
  display: block;
  text-align: right;
  font-size: 1.5em;
  font-weight: 300;
`;

export const Temp = () => {
  const config = useConfig();
  const [tempData] = useService("temp");
  const [groups] = useService("hue");

  if (!tempData || !groups) return <Loader />;

  return (
    <ServiceBox title={config.temp?.label}>
      <Container>
        {Object.entries(tempData).map(([id, { name, value }]) => {
          const deg = value / 100;
          const color = getTempColor(deg, [5, 35]);
          const icon = Object.values(groups).find(
            (o) => o.name === name
          )?.class;

          return (
            <Item key={id} style={{ color }}>
              {icon ? <Icon hueClass={icon} size={42} /> : `${name}:`}
              <Degrees>{deg.toFixed(1)}</Degrees>
            </Item>
          );
        })}
      </Container>
    </ServiceBox>
  );
};

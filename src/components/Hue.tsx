import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import tinycolor from "tinycolor2";

import { colors } from "../styles";
import { CommonProps } from "../main";

import { bed, chair, child, lamp, sofa } from "./Icon";

const Container = styled.div`
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 1fr 1fr 1fr;
`;

const Group = styled.a<{ active: boolean; color: string; size?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: solid 3px
    ${({ active, color }) => (active ? color : colors.superDimmed)};
  width: 85px;
  height: 75px;
  cursor: pointer;

  svg {
    ${({ size }) =>
      css`
        height: ${size || "45px"};
        width: ${size || "45px"};
      `}

    path {
      fill: ${({ active, color }) => (active ? color : colors.superDimmed)};
    }
  }
`;

const iconMap: { [key in GroupClass]?: JSX.Element } = {
  "Living room": sofa,
  Office: chair,
  Bedroom: bed,
  "Kids bedroom": child,
  Hallway: lamp
};

export const Hue: React.SFC<CommonProps> = ({ socket, reportError }) => {
  const [groups, setGroups] = useState<HueGroups>({});

  const toggle = (id: string, action: HueEmitPayload) => {
    socket.emit("hue", { id, ...action });

    setGroups(state => ({
      ...state,
      [id]: {
        ...state[id],
        ...action
      }
    }));
  };

  useEffect(() => {
    const listener = (res: HueServiceData) =>
      res.data ? setGroups(res.data) : reportError(res.service, res.error);

    socket.on("hue", listener);

    return () => {
      socket.off("hue", listener);
    };
  }, []);

  return (
    <Container>
      {Object.keys(groups)
        .filter(k => groups[k].name !== "Kök")
        .map(k => {
          const group = groups[k];
          const icon = iconMap[group.class];
          const color = tinycolor({
            h: (group.hue / 65535) * 360, // hue in degrees,
            s: (group.sat / 254) * 100, // saturation in percentage
            l: (group.bri / 254) * 100 // lightness (brightness) in percentage
          }).toHexString();

          return (
            <Group
              key={group.name}
              color={color}
              active={group.on}
              size={group.name === "Hjalmar" ? "35px" : undefined}
              onClick={() => toggle(k, { on: !group.on })}
            >
              {icon}
            </Group>
          );
        })}
    </Container>
  );
};

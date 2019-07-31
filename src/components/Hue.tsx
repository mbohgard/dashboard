import React, { useCallback, useEffect, useState } from "react";
import tinycolor from "tinycolor2";

import { def, percentageOfRange } from "../utils/helpers";
import { CommonProps } from "../main";

import { bed, chair, child, computer, lamp, pot, sofa } from "./Icon";
import { ActionButton, ButtonGrid } from "./Atoms";

const iconMap: { [key in GroupClass]?: JSX.Element } = {
  "Living room": sofa,
  Office: chair,
  Bedroom: bed,
  "Kids bedroom": child,
  Kitchen: pot,
  Hallway: lamp,
  Computer: computer
};

export const Hue: React.SFC<CommonProps> = ({ socket, reportError }) => {
  const [groups, setGroups] = useState<HueGroups>({});

  const toggle = useCallback((id: string, action: HueEmitPayload) => {
    socket.emit("hue", { id, ...action });

    setGroups(state => ({
      ...state,
      [id]: {
        ...state[id],
        ...action
      }
    }));
  }, []);

  useEffect(() => {
    const listener = (res: HueServiceData) =>
      res.data ? setGroups(res.data) : reportError(res.service, res.error);

    socket.on("hue", listener);

    return () => {
      socket.off("hue", listener);
    };
  }, []);

  return (
    <ButtonGrid>
      {Object.keys(groups)
        .filter(k => Object.keys(iconMap).includes(groups[k].class))
        .map(k => {
          const { hue, sat, bri, ct, ...group } = groups[k];
          const icon = iconMap[group.class];

          Array.isArray;
          const color = def(hue, sat, bri)
            ? tinycolor({
                // hue in degrees
                h: (hue! / 65535) * 360,
                // saturation in percentage
                s: (sat! / 254) * 100,
                // lightness (brightness) in percentage
                l: (bri! / 254) * 100
              }).toHexString()
            : def(ct, bri)
            ? tinycolor({
                ...tinycolor
                  .mix(
                    tinycolor("#ffa500"),
                    tinycolor("fff"),
                    percentageOfRange(153, 500)(ct!)
                  )
                  .toHsl(),
                l: (bri! / 254) * 100
              }).toHexString()
            : "#ddd";

          return (
            <ActionButton
              key={group.name}
              color={color}
              active={group.on}
              size={group.name === "Hjalmar" ? "48px" : undefined}
              onClick={() => toggle(k, { on: !group.on })}
            >
              {icon}
            </ActionButton>
          );
        })}
    </ButtonGrid>
  );
};

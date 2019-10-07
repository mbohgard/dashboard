import React, { useCallback } from "react";
import tinycolor from "tinycolor2";

import { useService } from "../hooks";
import { def, percentageOfRange } from "../utils/helpers";

import { bed, chair, child, computer, lamp, pot, sofa, hue } from "./Icon";
import { ActionButton, DimmedIconBox as Box, ButtonGrid } from "./Atoms";

const iconMap: { [key in GroupClass]?: JSX.Element } = {
  "Living room": sofa,
  Office: chair,
  Bedroom: bed,
  "Kids bedroom": child,
  Kitchen: pot,
  Hallway: lamp,
  Computer: computer
};

export const Hue: React.FC = () => {
  const [groups, send] = useService<HueServiceData>("hue", {});

  const toggle = useCallback((id: string, action: HueEmitPayload) => {
    const set = send({ id, ...action });

    set(state => ({
      ...state,
      [id]: {
        ...state![id],
        ...action
      }
    }));
  }, []);

  return (
    <Box>
      {hue}
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
    </Box>
  );
};

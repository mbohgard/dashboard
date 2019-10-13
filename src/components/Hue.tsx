import React from "react";
import tinycolor from "tinycolor2";

import { useService } from "../hooks";
import { def, percentageOfRange, limiter } from "../utils/helpers";

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
  const [groups, emit] = useService<HueServiceData>("hue", {});

  const toggle = (id: string, action: HueEmitPayload) => {
    const set = emit({ id, ...action });

    if (set)
      set(state => ({
        ...state,
        [id]: {
          ...state![id],
          ...action
        }
      }));
  };

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
                  s: sat! / 254,
                  v: limiter(bri! / 254, 0.15)
                }).toHexString()
              : def(ct, bri)
              ? tinycolor({
                  ...tinycolor
                    .mix(
                      tinycolor("#7ad3ff"),
                      tinycolor("#ffa500"),
                      percentageOfRange(153, 500)(ct!)
                    )
                    .toHsv(),
                  v: limiter(bri! / 254, 0.15)
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

import React, { useState, useCallback } from "react";
import tinycolor from "tinycolor2";

import { useService } from "../hooks";
import {
  def,
  percentageOfRange,
  limiter,
  memo,
  debounce
} from "../utils/helpers";

import { bed, chair, child, computer, lamp, pot, sofa, hue } from "./Icon";
import { DimmedIconBox as Box, ButtonGrid } from "./Atoms";
import { ActionButton, Overlay } from "./Molecules";
import { Range } from "./Range";

const iconMap: { [key in GroupClass]?: JSX.Element } = {
  "Living room": sofa,
  Office: chair,
  Bedroom: bed,
  "Kids bedroom": child,
  Kitchen: pot,
  Hallway: lamp,
  Computer: computer
};

const getColor = memo((hue, sat, bri, ct) =>
  def(hue, sat, bri)
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
    : "#ddd"
);

export const Hue: React.FC = () => {
  const [groups, emit] = useService<HueServiceData>("hue", {});
  const [[adjustId, adjustColor], setAdjustId] = useState<
    [string, string] | []
  >([]);

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

  const adjust = useCallback(
    debounce((value: number) => {
      console.log(value);
    }),
    []
  );

  return (
    <Box>
      {hue}
      {adjustId && (
        <Overlay closeOnPress close={() => setAdjustId([])}>
          <Range color={adjustColor} onChange={adjust} initialValue={0} />
        </Overlay>
      )}
      <ButtonGrid>
        <ActionButton
          key="hej"
          color="white"
          active={false}
          onLongPress={() => setAdjustId(["hej", "white"])}
        >
          {iconMap.Kitchen}
        </ActionButton>
        {Object.keys(groups)
          .filter(k => Object.keys(iconMap).includes(groups[k].class))
          .map(k => {
            const { hue, sat, bri, ct, ...group } = groups[k];
            const icon = iconMap[group.class];

            Array.isArray;
            const color = getColor(hue, sat, bri, ct);

            return (
              <ActionButton
                key={group.name}
                color={color}
                active={group.on}
                size={group.name === "Hjalmar" ? "48px" : undefined}
                onPress={() => toggle(k, { on: !group.on })}
                onLongPress={() => setAdjustId([k, color])}
              >
                {icon}
              </ActionButton>
            );
          })}
      </ButtonGrid>
    </Box>
  );
};

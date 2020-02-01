import React, { useState, useCallback } from "react";
import tinycolor from "tinycolor2";

import { useService } from "../hooks";
import {
  def,
  percentageOfRange,
  limiter,
  memo,
  throttle,
  roundedPercentageOf,
  roundedValueFromPercentage
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

  const send = (id: string, payload: HueEmitPayload) => {
    const set = emit({ id, ...payload });

    if (set)
      set(state => ({
        ...state,
        [id]: {
          ...state![id],
          ...payload
        }
      }));
  };

  const adjust = useCallback(
    throttle((value: number) => {
      const bri = roundedValueFromPercentage(value, 254);

      if (adjustId && groups[adjustId].bri !== bri)
        send(adjustId, { bri, on: Boolean(bri) });
    }, 1000),
    [adjustId, groups]
  );

  return (
    <Box>
      {hue}
      {adjustId && (
        <Overlay closeOnPress close={() => setAdjustId([])} autoClose={5000}>
          <Range
            color={adjustColor}
            onChange={adjust}
            initialValue={roundedPercentageOf(groups[adjustId].bri, 254)}
          />
        </Overlay>
      )}
      <ButtonGrid>
        {Object.keys(groups)
          .filter(id => Object.keys(iconMap).includes(groups[id].class))
          .map(id => {
            const { hue, sat, bri, ct, ...group } = groups[id];
            const icon = iconMap[group.class];

            Array.isArray;
            const color = getColor(hue, sat, bri, ct);

            return (
              <ActionButton
                key={group.name}
                color={color}
                active={group.on}
                size={group.name === "Hjalmar" ? "48px" : undefined}
                onPress={() => send(id, { on: !group.on })}
                onLongPress={() => setAdjustId([id, color])}
              >
                {icon}
              </ActionButton>
            );
          })}
      </ButtonGrid>
    </Box>
  );
};

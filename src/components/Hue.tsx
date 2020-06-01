import React, { useState, useCallback, useMemo } from "react";

import { useService } from "../hooks";
import { colors } from "../styles";
import { throttle, roundedValueFromPercentage } from "../utils/helpers";
import { satOrBriPercentage, lights2background } from "../utils/color";

import { Icon } from "./Icon";
import { ButtonGrid } from "./Atoms";
import { ServiceBox } from "./Molecules";
import { ActionButton, Overlay } from "./Molecules";
import { Range } from "./Range";

const iconMap: { [key in HueGroupClass]?: JSX.Element } = {
  "Living room": <Icon RoomsLiving />,
  Office: <Icon RoomsOffice />,
  Bedroom: <Icon RoomsBedroom />,
  "Kids bedroom": <Icon RoomsKidsbedroom />,
  Kitchen: <Icon RoomsKitchen />,
  Hallway: <Icon RoomsHallway />,
  Computer: <Icon RoomsComputer />,
  Lounge: <Icon RoomsLounge />,
};

const getIconColor = (bri: number) =>
  satOrBriPercentage(bri) > 50 ? colors.black : colors.white;

export const Hue: React.FC = () => {
  const [groups, emit] = useService<HueServiceData, HueGroupEmit>("hue", {});
  const [adjustId, setAdjustId] = useState<string | void>();

  const send = useCallback(
    ({ id, ...payload }: HueGroupEmit) => {
      const set = emit({ id, ...payload });

      if (set)
        set((state) => ({
          ...state,
          [id]: {
            ...state![id],
            ...payload,
          },
        }));
    },
    [emit]
  );

  const toggle = useCallback(
    (id: string, currentState: boolean) => send({ id, on: !currentState }),
    [send]
  );

  const adjust = useCallback(
    throttle((value: number) => {
      const bri = roundedValueFromPercentage(value, 254);

      if (adjustId) send({ id: adjustId, bri, on: Boolean(bri) });
    }, 300),
    [adjustId]
  );

  const buttons = useMemo(
    () =>
      Object.entries(groups)
        .filter(([, group]) => Object.keys(iconMap).includes(group.class))
        .map(([id, group]) => {
          const icon = iconMap[group.class];
          const { value: bg, bri } = lights2background(
            group.on,
            group.lights || undefined
          );
          const color = getIconColor(bri);

          return (
            <ActionButton
              key={id}
              id={id}
              color={color}
              background={bg}
              active={group.on}
              onPress={toggle}
              onLongPress={setAdjustId}
            >
              {icon}
            </ActionButton>
          );
        }),
    [groups, toggle, setAdjustId]
  );

  return (
    <ServiceBox title="Hue" type="icons">
      {adjustId && (
        <Overlay closeOnPress close={setAdjustId} autoClose={5000}>
          <Range
            onChange={adjust}
            initialValue={satOrBriPercentage(groups[adjustId].bri)}
          />
        </Overlay>
      )}
      <ButtonGrid>{buttons}</ButtonGrid>
    </ServiceBox>
  );
};

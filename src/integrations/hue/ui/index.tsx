import React, { useState, useCallback, useMemo } from "react";

import { useService } from "../../../hooks";
import { colors } from "../../../styles";
import { debounce, roundedValueFromPercentage } from "../../../utils/helpers";
import { satOrBriPercentage } from "../../../utils/color";

import { Icon } from "../../../components/Icon";
import { ButtonGrid } from "../../../components/Atoms";
import { ServiceBox } from "../../../components/Molecules";
import { ActionButton, Overlay } from "../../../components/Molecules";
import { Range } from "../../../components/Range";
import { lights2background } from "../helpers";

const getIconColor = (bri: number) =>
  satOrBriPercentage(bri) > 50 ? colors.black : colors.white;

export const Hue: React.FC = () => {
  const [groups, emit] = useService("hue", {});
  const [adjustId, setAdjustId] = useState<string>();

  const send = useCallback(
    ({ id, ...payload }: Parameters<typeof emit>[0]) => {
      const set = emit({ id, ...payload });

      if (set)
        set((state) => ({
          ...state,
          [id]: {
            ...state![id]!,
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
    debounce((value: number) => {
      const bri = roundedValueFromPercentage(value, 254);

      if (adjustId) send({ id: adjustId, bri, on: Boolean(bri) });
    }, 300),
    [adjustId]
  );

  const buttons = useMemo(
    () =>
      Object.entries(groups).map(([id, group]) => {
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
            badge={group.name.charAt(0).toUpperCase()}
            active={group.on}
            onPress={toggle}
            onLongPress={setAdjustId}
          >
            <Icon hueClass={group.class} />
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
            initialValue={satOrBriPercentage(groups[adjustId]!.bri)}
          />
        </Overlay>
      )}
      <ButtonGrid>{buttons}</ButtonGrid>
    </ServiceBox>
  );
};

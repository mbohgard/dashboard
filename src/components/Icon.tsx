import React from "react";
import styled, { css } from "styled-components";

import { pascal } from "../utils/helpers";

import type { HueGroupClass } from "../integrations/hue/types";

const allIcons = import.meta.glob<React.FC>("../assets/icons/*.svg", {
  eager: true,
  query: "?react",
  import: "default",
});

type Props = { size?: number };
type Icon = ReturnType<typeof createComp>;
type IconsObj = {
  [s: string]: Icon;
};

const createComp = (C: React.FC, initialSize?: number) => styled(C)<Props>`
  width: 50px;
  height: 50px;

  ${({ size }) =>
    (initialSize || size) &&
    css`
      width: ${initialSize || size}px;
      height: ${initialSize || size}px;
    `}
`;

const Fallback = createComp(
  styled.span`
    background: red;
  `,
  50,
);

const iconsObj: IconsObj = Object.entries(allIcons).reduce<IconsObj>(
  (acc, [path, C]) => ({
    ...acc,
    [pascal(path.slice(path.lastIndexOf("/") + 1, -4))]: createComp(C),
  }),
  {},
);

const iconNameFromHueClass = (hueClass: HueGroupClass) =>
  Object.keys(iconsObj).reduce(
    (acc, key) =>
      acc ||
      (hueClass.replace(" ", "") === key.replace("Rooms", "") ? key : ""),
    "",
  );

type IconProps = { [name: string]: any } & { name?: string } & {
  hueClass?: HueGroupClass;
} & Props;

export const Icon = React.memo(({ size, name, hueClass, ...p }: IconProps) => {
  const Comp =
    iconsObj[
      name ||
        (hueClass
          ? iconNameFromHueClass(hueClass)
          : Object.entries(p).reduce(
              (acc, [k, v]) => (v === true ? k : acc),
              "",
            ))
    ] || Fallback;

  return <Comp size={size} />;
});

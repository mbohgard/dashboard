import React from "react";
import styled, { css, type IStyledComponent } from "styled-components";

import { pascal } from "../utils/helpers";

import allIcons from "../assets/icons/*.svg";

type Props = { size?: number };
type Imported = { [s: string]: { default: React.FC } };
type Icon = IStyledComponent<"web", Props>;
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
  50
);

const iconsObj: IconsObj = Object.entries(
  allIcons as unknown as Imported
).reduce<IconsObj>(
  (acc, [key, { default: C }]) => ({
    ...acc,
    [pascal(key)]: createComp(C),
  }),
  {}
);

const iconNameFromHueClass = (hueClass: HueGroupClass) =>
  Object.keys(iconsObj).reduce(
    (acc, key) =>
      acc ||
      (hueClass.replace(" ", "") === key.replace("Rooms", "") ? key : ""),
    ""
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
              ""
            ))
    ] || Fallback;

  return <Comp size={size} />;
});

import React from "react";
import styled, { css, StyledComponent } from "styled-components";

import { pascal } from "../utils/helpers";

import allIcons from "../assets/icons/*.svg";

type Props = { size?: number };
type Imported = { [s: string]: { default: React.FC } };
type Icon = StyledComponent<React.FC<{}>, any, Props, never>;
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
  (allIcons as unknown) as Imported
).reduce(
  (acc, [key, { default: C }]) => ({
    ...acc,
    [pascal(key)]: createComp(C),
  }),
  {} as IconsObj
);

type IconProps = { [name: string]: any } & { name?: string } & Props;

export const Icon = React.memo(({ size, name, ...p }: IconProps) => {
  const Comp =
    iconsObj[
      name ||
        Object.entries(p).reduce((acc, [k, v]) => (v === true ? k : acc), "")
    ] || Fallback;

  return <Comp size={size} />;
});

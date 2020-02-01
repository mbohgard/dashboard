import React, { useEffect } from "react";
import tinycolor from "tinycolor2";
import styled, { css } from "styled-components";

import { limiter, areEqual } from "../utils/helpers";
import { useTouchPress } from "../hooks";
import { colors } from "../styles";

export const activeColor = (c: string = "#fff") => {
  const color = tinycolor(c).toHsv();

  return tinycolor({
    ...color,
    v: limiter(color.v, 0.7)
  }).toRgbString();
};

type ActionButtonProps = {
  active: boolean;
  color?: string;
  size?: string;
  onPress?(): void;
  onLongPress?(): void;
};

const ActionButtonLink = styled.a<ActionButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: solid 3px
    ${({ active, color }) => (active ? activeColor(color) : colors.superDimmed)};
  width: 110px;
  height: 100px;
  cursor: pointer;

  svg {
    ${({ size }) =>
      css`
        height: ${size || "55px"};
        width: ${size || "55px"};
      `}

    path {
      fill: ${({ active, color = colors.white }) =>
        active ? color : colors.superDimmed};
    }
  }
`;

export const ActionButton: React.FC<ActionButtonProps> = React.memo(
  ({ onPress, onLongPress, ...props }) => {
    const [press, release] = useTouchPress({ onPress, onLongPress });

    return (
      <ActionButtonLink {...props} onTouchStart={press} onTouchEnd={release} />
    );
  },
  (
    { onPress: _, onLongPress: __, ...pp },
    { onPress: ___, onLongPress: ____, ...p }
  ) => areEqual(pp, p)
);

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
  z-index: 89;
  background: rgba(0, 0, 0, 0.8);
`;

type OverlayProps = {
  autoClose?: number;
  closeOnPress?: boolean;
  show?: boolean;
  close?(): void;
};

const events = ["touchstart", "touchmove", "touchend"] as const;

export const Overlay: React.FC<OverlayProps> = ({
  autoClose,
  children,
  close,
  closeOnPress
}) => {
  useEffect(() => {
    if (!autoClose || !close) return;

    let t: number;

    const resetTimer = () => {
      clearTimeout(t);

      t = setTimeout(close, autoClose);
    };

    events.forEach(e => document.addEventListener(e, resetTimer));

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));

      clearTimeout(t);
    };
  }, []);

  return (
    <OverlayContainer onClick={(closeOnPress || undefined) && close}>
      {children}
    </OverlayContainer>
  );
};

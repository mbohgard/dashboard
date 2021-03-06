import React, { useEffect } from "react";
import styled, { css } from "styled-components";

import { useTouchPress } from "../hooks";
import { colors } from "../styles";

import { Loader } from "./Atoms";

type ServiceBoxProps = {
  type?: "normal" | "icons";
  title?: string;
  loading?: boolean;
};

const ServiceContainer = styled.div`
  margin: 0 20px;
  margin-right: 0;
  display: flex;
  flex-direction: column;
`;

const ServiceContent = styled.div<ServiceBoxProps>`
  display: flex;
  flex-direction: row;
  position: relative;
  flex-grow: 1;
`;

const ServiceTitle = styled.h3<ServiceBoxProps>`
  color: ${colors.gray};
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 20px;
  text-transform: uppercase;
  width: 100%;
  margin-bottom: 5px;

  ${({ type }) =>
    type === "icons" &&
    css`
      padding: 0 0 10px 5px;
    `};

  > span {
    margin-right: 10px;
  }

  &:after {
    content: "";
    width: 100%;
    height: 0;
    border: solid 1px ${colors.superDimmed};
  }
`;

const ServiceBoxLoader = styled(Loader)`
  margin: 20px auto;
`;

export const ServiceBox: React.FC<ServiceBoxProps> = ({
  children,
  title,
  loading,
  type,
  ...props
}) => {
  return (
    <ServiceContainer {...props}>
      {title && (
        <ServiceTitle type={type}>
          <span>{title}</span>
        </ServiceTitle>
      )}
      {loading ? (
        <ServiceBoxLoader />
      ) : (
        <ServiceContent>{children}</ServiceContent>
      )}
    </ServiceContainer>
  );
};

type ActionButtonProps = {
  active: boolean;
  color?: string;
  background?: string;
  id: string;
  size?: string;
  onPress?(id: string, active: boolean): void;
  onLongPress?(id: string): void;
};

const ActionButtonLink = styled.a<ActionButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: inset 0 0 0 3px
    ${({ active, background }) =>
      active
        ? background
          ? "transparent"
          : colors.white
        : colors.superDimmed};
  width: 115px;
  height: 100%;
  min-height: 100px;
  cursor: pointer;
  background: ${({ active, background }) =>
    active ? background : "transparent"};

  & * {
    pointer-events: none;
  }

  & svg {
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
    const touchEvents = useTouchPress({
      onPress: () => onPress?.(props.id, props.active),
      onLongPress: () => onLongPress?.(props.id),
    });

    return <ActionButtonLink {...props} {...touchEvents} />;
  }
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
  className?: string;
  closeOnPress?: boolean;
  close?(...args: any[]): void;
};

const events = ["touchstart", "touchmove", "touchend"] as const;

export const Overlay: React.FC<OverlayProps> = ({
  autoClose,
  children,
  close,
  closeOnPress,
  ...props
}) => {
  useEffect(() => {
    if (!autoClose || !close) return;

    let t: number;

    const resetTimer = () => {
      clearTimeout(t);

      t = setTimeout(close, autoClose);
    };

    events.forEach((e) => document.addEventListener(e, resetTimer));

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));

      clearTimeout(t);
    };
  }, []);

  return (
    <OverlayContainer
      onClick={() => closeOnPress !== false && close?.()}
      {...props}
    >
      {children}
    </OverlayContainer>
  );
};

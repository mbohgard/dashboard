import React, { useRef } from "react";
import styled, { css } from "styled-components";

import { useIsIdle, useService } from "../../../hooks";
import { colors } from "../../../styles";
import { Icon } from "../../../components/Icon";
import { Loader } from "../../../components/Atoms";
import { ScrollIndicator } from "../../../components/ScrollIndicator";

const Container = styled.div`
  position: relative;
  height: calc(100% + 4px);
  display: flex;
  align-items: flex-end;

  .energy-scroll {
    position: absolute;
    bottom: 12px;
    top: auto;
    scale: 0.8;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  gap: 16px;
  width: calc(100% - 45px);
  height: 100%;
  padding-bottom: 10px;
  overflow: hidden;
  overflow-x: auto;
`;

const DataContainer = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  min-width: 100%;
  font-size: 10px;
  gap: 18px;
`;

const Heading = styled.h4`
  font-size: 15px;
  color: ${colors.dimmed};
  text-transform: uppercase;
  text-align: center;
  padding: 6px;
  border-radius: 8px;
  background: ${colors.megaDimmed};
`;

const iconSize = (size: number) => css`
  min-width: ${size}em;
  min-height: ${size}em;
  max-width: ${size}em;
  max-height: ${size}em;
`;

const DataItem = styled.li<{
  color: string;
  flipIcon?: boolean;
  size?: 1 | 2;
}>`
  display: flex;
  align-items: center;
  font-size: ${({ size }) =>
    size === 1 ? "3em" : size === 2 ? "4em" : "2.2em"};
  gap: 6px;
  color: ${({ size, color }) => (size ? color : colors.dimmed)};

  svg {
    ${({ color, size }) => css`
      fill: ${size ? colors.white : color};
      ${iconSize(1)}
    `}
    transform: rotate(${({ flipIcon }) => (flipIcon ? "180deg" : "0")});
  }

  div span {
    font-size: 18px;
    margin-left: 6px;
    color: ${colors.superDimmed};
  }

  div > div {
    padding-top: 4px;
    font-size: 20px;

    > em {
      color: ${colors.superDimmed};
    }
  }
`;

type DataProps = {
  flipIcon?: boolean;
  icon?: React.ReactNode;
  value?: number;
  text?: string;
  size?: 1 | 2;
};

const Data = ({ flipIcon, icon, value, text, size }: DataProps) => (
  <DataItem size={size} color={color(value)} flipIcon={flipIcon}>
    {icon}
    <div>
      {formatValue(value)}
      <span>{text}</span>
    </div>
  </DataItem>
);

const color = (n?: number) => {
  if (n === undefined) return colors.white;

  return n > 99 ? colors.red : n > 60 ? colors.orange : colors.green;
};

const formatValue = (n?: number) =>
  n ? (Math.round(n * 100) / 100).toFixed(2) : null;

export const Energy = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data] = useService("energy");

  useIsIdle(() => {
    containerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  });

  if (!data) return <Loader />;

  return (
    <Container>
      <InnerContainer id="energyContainer" ref={containerRef}>
        <DataContainer>
          <Data
            icon={<Icon Plug />}
            value={data?.now?.value}
            text="öre"
            size={2}
          />
          <Data
            icon={<Icon Average />}
            value={data?.average?.value}
            text="öre"
            size={1}
          />
          <Data
            icon={<Icon Arrow />}
            value={data?.high?.value}
            text={`(${data?.high?.time})`}
          />
          <Data
            icon={<Icon Arrow />}
            flipIcon
            value={data?.low?.value}
            text={`(${data?.low?.time})`}
          />
        </DataContainer>
        {data?.tomorrow && (
          <DataContainer>
            <Heading>Imorgon</Heading>
            <Data
              icon={<Icon Average />}
              value={data?.tomorrow?.average?.value}
              text="öre"
              size={1}
            />
            <Data
              icon={<Icon Arrow />}
              value={data?.tomorrow?.high?.value}
              text={`(${data?.tomorrow?.high?.time})`}
            />
            <Data
              icon={<Icon Arrow />}
              flipIcon
              value={data?.tomorrow?.low?.value}
              text={`(${data?.tomorrow?.low?.time})`}
            />
          </DataContainer>
        )}
      </InnerContainer>
      {data?.tomorrow && (
        <ScrollIndicator
          className="energy-scroll"
          getInnerWidth={() => containerRef.current?.clientWidth ?? 0}
          elementId="energyContainer"
          deps={[data]}
        />
      )}
    </Container>
  );
};

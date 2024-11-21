import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { colors } from "../styles";
import { useIsIdle } from "../hooks";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 5px;
`;

const TabsWrapper = styled.ul`
  position: relative;
  display: flex;
  overflow: hidden;
  min-height: 50px;

  &:after {
    content: "";
    position: absolute;
    width: 100%;
    bottom: 0;
    height: 22px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), ${colors.black});
    z-index: 51;
    pointer-events: none;
  }
`;

const Tab = styled.li<{ active: boolean }>`
  display: block;
  position: relative;
  translate: ${(p) => (p.active ? 0 : "0 5px")};
  z-index: ${(p) => (p.active ? `50 !important` : 0)};
  color: ${(p) => (p.active ? colors.white : colors.gray)};
  background: ${(p) => (p.active ? colors.hyperDimmed : colors.black)};
  font-size: 18px;
  text-transform: uppercase;
  padding: 10px 16px;
  padding-bottom: 0π;
  border: solid 2px ${colors.ultraDimmed};
  border-bottom: none;
  margin-left: -8px;
  border-radius: 3px;
  transition: translate 0.2s;

  &:first-child {
    margin-left: 0;
  }
`;

const TabContentContainer = styled.div`
  display: flex;
  width: 100%;
  transition: translate 0.3s ease-in-out;
  min-height: 0;
`;

const TabContent = styled.div`
  min-width: 100%;
  padding-top: 2px;
  min-height: 0;
`;

type TabsProps = {
  items?: Array<[label: string, element: JSX.Element, id?: string]>;
  defaultSelected?: string;
  resetDelay?: number;
};

export const Tabs: React.FC<TabsProps> = ({
  defaultSelected,
  items,
  resetDelay = 10000,
}) => {
  const content = useRef<HTMLDivElement | null>(null);

  const getInitialState = () =>
    defaultSelected
      ? (items?.findIndex(([label]) => defaultSelected === label) ?? 0)
      : 0;

  const [selected, setSelected] = useState(getInitialState);

  const translate = useCallback((ix: number) => {
    const el = content.current;

    if (!el) return;
    el.style.translate = `-${ix * 100}%`;
  }, []);

  useEffect(() => {
    translate(selected);
  }, [selected, translate]);

  useIsIdle(
    () => {
      setSelected(getInitialState());
    },
    { timeout: resetDelay }
  );

  return (
    <Container>
      <TabsWrapper>
        {items?.map(([label, , id], ix) => (
          <Tab
            key={label}
            id={id}
            onClick={() => setSelected(ix)}
            active={selected === ix}
            style={{ zIndex: items.length - ix }}
          >
            {label}
          </Tab>
        ))}
      </TabsWrapper>
      <TabContentContainer ref={content}>
        {items?.map(([label, element]) => (
          <TabContent key={label}>{element}</TabContent>
        ))}
      </TabContentContainer>
    </Container>
  );
};

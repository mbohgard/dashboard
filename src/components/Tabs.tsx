import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { colors } from "../styles";
import { useOnIdle } from "../hooks";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 10px;
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
    z-index: 2;
    pointer-events: none;
  }
`;

const Tab = styled.li<{ active: boolean }>`
  display: block;
  position: relative;
  translate: ${(p) => (p.active ? 0 : "0 5px")};
  z-index: ${(p) => (p.active ? 1 : 0)};
  color: ${(p) => (p.active ? colors.white : colors.gray)};
  background: ${(p) => (p.active ? colors.hyperDimmed : colors.black)};
  font-size: 18px;
  text-transform: uppercase;
  padding: 10px 16px;
  padding-bottom: 0;
  border: solid 2px ${colors.ultraDimmed};
  border-bottom: none;
  margin-left: -6px;
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
  items?: Array<[label: string, element: JSX.Element]>;
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
      ? items?.findIndex(([label]) => defaultSelected === label) ?? 0
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

  useOnIdle(
    () => {
      setSelected(getInitialState());
    },
    { timeout: resetDelay }
  );

  return (
    <Container>
      <TabsWrapper>
        {items?.map(([label], ix) => (
          <Tab
            key={label}
            onClick={() => setSelected(ix)}
            active={selected === ix}
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

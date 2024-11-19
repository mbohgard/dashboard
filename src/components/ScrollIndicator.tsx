import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

import { colors } from "../styles";
import { useStableCallback } from "../hooks";

const Container = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  height: 6px;
  width: 100px;
  border-radius: 3px;
  translate: -50% 0;
  background: ${colors.ultraDimmed};
  z-index: 1;
  pointer-events: none;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: var(--left);
    height: 100%;
    width: var(--width);
    background: ${colors.superDimmed};
    border-radius: 3px;
  }
`;

const getMeasurements = (
  el: HTMLDivElement,
  id: string,
  getInnerWidth: () => number
) => {
  const app = document.getElementById(id) as HTMLDivElement;
  const sw = app.scrollWidth;
  const ww = getInnerWidth() ?? window.innerWidth;
  const width = Math.round((ww / sw) * 100);

  return {
    app,
    el,
    width,
    ww,
    sw,
  };
};

type Props = {
  className?: string;
  elementId?: string;
  getInnerWidth?: () => number;
  deps?: any[];
};

export const ScrollIndicator = ({
  className,
  getInnerWidth,
  elementId = "app",
  deps = [],
}: Props) => {
  const container = useRef<HTMLDivElement | null>(null);
  const [measurements, setMeasurements] = useState<ReturnType<
    typeof getMeasurements
  > | null>(null);
  const _getInnerWidth = useStableCallback(getInnerWidth);

  useEffect(() => {
    if (!container.current) return;
    setMeasurements(
      getMeasurements(container.current, elementId, _getInnerWidth)
    );
  }, [elementId, ...deps]);

  useEffect(() => {
    if (!measurements) return;

    const { app, el, sw } = measurements;

    const listener = () => {
      const x = app.scrollLeft;
      const left = Math.round((x / sw) * 100);

      el.style.setProperty("--left", `${left}%`);
    };

    app.addEventListener("scroll", listener);
    return () => app.removeEventListener("scroll", listener);
  }, [measurements, ...deps]);

  return (
    <Container
      ref={container}
      className={className}
      style={{ "--width": `${measurements?.width}%` } as React.CSSProperties}
    />
  );
};

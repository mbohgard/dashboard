import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import styled from "styled-components";

import { colors } from "../styles";

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

const getMeasurements = (el: HTMLDivElement) => {
  const app = document.getElementById("app") as HTMLDivElement;
  const sw = app.scrollWidth;
  const ww = window.innerWidth;
  const width = Math.round((ww / sw) * 100);

  return {
    app,
    el,
    width,
    ww,
    sw,
  };
};

export const ScrollIndicator = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const [measurements, setMeasurements] = useState<ReturnType<
    typeof getMeasurements
  > | null>(null);

  useLayoutEffect(() => {
    if (!container.current) return;
    setMeasurements(getMeasurements(container.current));
  }, []);

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
  }, [measurements]);

  return (
    <Container
      ref={container}
      style={{ "--width": `${measurements?.width}%` } as React.CSSProperties}
    />
  );
};

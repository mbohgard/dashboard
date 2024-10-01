import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

import { useService, useStableCallback, useThrottle } from "../../../hooks";
import { Loader } from "../../../components/Atoms";

const clickAnimation = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;

  img {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 95%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 2s;
    border-radius: 8px;
  }
`;

const ClickArea = styled.button`
  content: "";
  background: rgba(255, 255, 255, 0.2);
  border: none;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 95%;
  box-shadow: inset 0 0 50px 30px rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  animation: ${clickAnimation} 0.8s ease-out forwards;
  z-index: 1;
`;

export const ICloud = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [data] = useService("icloud");
  const [id, setId] = useState(-1);
  const th1 = useThrottle({ interval: 1000 });

  const next = useStableCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    const target = e?.target as HTMLButtonElement;

    const exec = () => setId((s) => (data?.[s + 1] ? s + 1 : 0));

    if (target) {
      th1(() => {
        target.style.animation = "none";
        target.offsetHeight; /* trigger reflow */
        target.style.animation = "";
        exec();
      });
    } else exec();
  });

  useEffect(() => {
    if (!data) return;

    if (id < 0) setId(0);

    const t = setTimeout(next, 10000);

    return () => clearTimeout(t);
  }, [data, id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || id < 0) return;

    const prevImg = el.querySelectorAll("img");
    const img = document.createElement("img");

    img.onload = () => (img.style.opacity = "1");
    img.ontransitionend = () => prevImg.forEach((el) => el.remove());
    img.src = data?.[id]!;

    el.appendChild(img);
  }, [id]);

  return (
    <Container ref={containerRef}>
      {!data ? <Loader /> : <ClickArea type="button" onClick={next} />}
    </Container>
  );
};

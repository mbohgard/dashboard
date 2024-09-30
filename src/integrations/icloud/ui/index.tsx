import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { useService } from "../../../hooks";
import { Loader } from "../../../components/Atoms";

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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 2s;
    border-radius: 8px;
  }
`;

export const ICloud = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [data] = useService("icloud");
  const [id, setId] = useState(-1);

  useEffect(() => {
    if (!data) return;

    if (id < 0) setId(0);

    const t = setTimeout(() => {
      setId((s) => (data[s + 1] ? s + 1 : 0));
    }, 10000);

    return () => clearTimeout(t);
  }, [data, id]);

  useEffect(() => {
    if (!containerRef.current || !data || id < 0) return;

    const prevImg = containerRef.current.querySelectorAll("img");
    const img = document.createElement("img");
    img.src = data[id]!;
    containerRef.current.appendChild(img);

    let t1: number, t2: number;

    t1 = window.setTimeout(
      () => {
        img.style.opacity = "1";

        t2 = window.setTimeout(() => {
          prevImg.forEach((el) => el.remove());
        }, 2000);
      },
      id < 0 ? 0 : 2000
    );

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [id]);

  return <Container ref={containerRef}>{!data && <Loader />}</Container>;
};

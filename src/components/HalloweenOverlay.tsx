import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

import { randomInt } from "../utils/helpers";
import { sec2Ms } from "../utils/time";

import scream from "../assets/halloween/scream.png";
import scream2 from "../assets/halloween/scream2.png";
import chucky from "../assets/halloween/chucky.png";
import pennywise from "../assets/halloween/pennywise.png";
import pennywise2 from "../assets/halloween/pennywise2.png";
import jason from "../assets/halloween/jason.png";
import jason2 from "../assets/halloween/jason2.png";
import freddy from "../assets/halloween/freddy.png";
import spiderweb1 from "../assets/halloween/spiderweb1.png";
import spiderweb4 from "../assets/halloween/spiderweb4.png";
import spider from "../assets/halloween/spider.png";

const glitch = keyframes`
  0% {
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  20% {
    opacity: 0.3;
  }
  25% {
    opacity: 1;
  }
  40% {
    opacity: 1;
  }
  45% {
    translate: 0 0;
    opacity: 0;
  }
  46% {
    scale: 1;
  }
  47% {
    scale: 1.6;
    translate: -40px 10px;
    opacity: 1;
  }
  48% {
    scale: 1;
  }
  50% {
    opacity: 0;
  }
  52% {
    translate: 0 0;
    opacity: 1;
  }
  60% {
    scale: 1;
    translate: 0 0;
    opacity: 0.5;
  }
  62% {
    scale: 2;
    translate: -120px -40px;
    opacity: 1;
  }
  65% {
    translate: 0 0;
  }
  66% {
    translate: 60px 0;
  }
  70% {
    opacity: 0.2;
  }
  72% {
    opacity: 1;
  }
  73% {
    opacity: 0;
  }
  78% {
    opacity: 1;
  }
  85% {
    translate: 60px 0;
  }
  86% {
    translate: 80px -30px;
  }
  88% {
    scale: 1;
    translate: 0 0;
  }
  89% {
    scale: 1.4;
  }
  90% {
    opacity: 1;
  }
  91% {
    scale: 1.4;
  }
  92% {
    scale: 1;
  }
  100% {
    opacity: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;

  > img {
    position: absolute;
  }

  > img:nth-child(1) {
    opacity: 0.6;
    height: 30%;
    z-index: -1;
  }

  > img:nth-child(2) {
    opacity: 0.6;
    height: 40%;
    top: -10px;
    scale: -1 1;
    right: -15px;
    z-index: -1;
  }

  > img:nth-child(3) {
    mix-blend-mode: lighten;
    opacity: 0.8;
    height: 16%;
    z-index: -1;
    bottom: -20px;
    left: -10px;
    rotate: 200deg;
  }
`;

const Inner = styled.div`
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200%;
  height: 200%;
  position: fixed;
  z-index: 99;
  top: -50%;
  left: -50%;
  animation: ${glitch} forwards 2s;
  pointer-events: none;

  img {
    height: 50%;
    width: auto;
  }
`;

const images = [
  scream,
  scream2,
  chucky,
  pennywise,
  pennywise2,
  freddy,
  jason,
  jason2,
];

const getRandomImage = (current?: string): string => {
  if (!current) return images[0]!;

  const ix = randomInt(0, images.length - 1);
  const image = images[ix]!;

  return image === current ? getRandomImage(current) : image;
};

export const HalloweenOverlay: React.FC = () => {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(
      () => {
        setImage(getRandomImage);
      },
      randomInt(sec2Ms(15), sec2Ms(45))
    );

    return () => clearTimeout(t);
  }, [image]);

  return (
    <>
      <Overlay>
        <img src={spiderweb1} />
        <img src={spiderweb4} />
        <img src={spider} />
      </Overlay>
      {image && (
        <Inner key={image}>
          <img src={image} />
        </Inner>
      )}
    </>
  );
};

import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

import santaUrl from "../assets/xmas/santa.webm";
import presentsUrl from "../assets/xmas/presents.webm";
import snowUrl from "../assets/xmas/snow.webm";
import { randomInt } from "../utils/helpers";

const Overlay = styled.div`
  position: fixed;
  z-index: 60;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const santaLeft2Right = keyframes`
  from {
    translate: -100% 30%;
  } to {
    translate: 100% -30%;
  }
`;

const santaRight2Left = keyframes`
  from {
    translate: 100% 30%;
  } to {
    translate: -100% -30%;
  }
`;

const commonVideoAttrs = {
  autoPlay: true,
  loop: true,
  muted: true,
  playsInline: true,
} as const;

type VideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  playing: boolean;
};

type SantaProps = {
  direction: "l2r" | "r2l";
};

const Santa = styled.video.attrs(commonVideoAttrs)<VideoProps & SantaProps>`
  display: ${(props) => (props.playing ? "block" : "none")};
  transform: rotateX(
      ${(props) => (props.direction === "l2r" ? "-8deg" : "8deg")}
    )
    rotateY(${(props) => (props.direction === "l2r" ? "0deg" : "180deg")});
  animation: ${({ direction, playing }) =>
      playing && (direction === "l2r" ? santaLeft2Right : santaRight2Left)}
    8s linear forwards;
`;

const presents = keyframes`
  80% {
    opacity: 1;
  } 100% {
    opacity: 0;
  }
`;

const Presents = styled.video.attrs(commonVideoAttrs)<VideoProps>`
  display: ${(props) => (props.playing ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 50%;
  translate: -50% 0;
  animation: ${(props) => props.playing && presents} 7s linear forwards;
`;

const snow = keyframes`
  0% {
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const Snow = styled(Presents)`
  animation: ${(props) => props.playing && snow} 9s linear forwards;
`;

const VIDEOS = ["santa1", "santa2", "presents", "snow"] as const;

type VideoCompProps = {
  video?: (typeof VIDEOS)[number] | undefined;
};

const Video = ({ video, ...rest }: VideoProps & VideoCompProps) => {
  if (!video) return null;

  const santaType = video === "santa1" ? "l2r" : "r2l";

  return video === "presents" ? (
    <Presents src={presentsUrl} {...rest} />
  ) : video === "snow" ? (
    <Snow src={snowUrl} {...rest} />
  ) : (
    <Santa src={santaUrl} key={santaType} direction={santaType} {...rest} />
  );
};

export const XmasOverlay = () => {
  const prevVideo = useRef<string | undefined>(undefined);
  const [video, setVideo] = useState<(typeof VIDEOS)[number] | undefined>(
    "snow"
  );
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (playing) return;

    prevVideo.current = video ?? prevVideo.current;

    const t = window.setTimeout(
      () => {
        const choices = VIDEOS.filter((v) => v !== prevVideo.current);
        setVideo(choices[Math.floor(Math.random() * choices.length)]);
      },
      randomInt(15, 45) * 1000
    );

    return () => window.clearTimeout(t);
  }, [playing, video]);

  return (
    <Overlay>
      <Video
        video={video}
        playing={playing}
        onAnimationEnd={() => {
          setVideo(undefined);
          setPlaying(false);
        }}
        onLoadedMetadata={() => {
          setPlaying(true);
        }}
      />
    </Overlay>
  );
};

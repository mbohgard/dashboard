import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styled, { css } from "styled-components";

import { useSonosService, useThrottle } from "../../../hooks";

import { Loader } from "../../../components/Atoms";
import { sec2Time } from "../../../utils/time";
import { colors } from "../../../styles";
import { addLeadingZero } from "../../../utils/helpers";
import { Icon } from "../../../components/Icon";
import type { SonosDevice, SonosEmit, SonosTrack } from "../types";
import { createPlaybackClock } from "./playbackClock";

const COVER_SIZE = 280;

const Container = styled.div`
  font-size: 16px;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 10px;
  background-repeat: no-repeat;
  background-position: center 20px;
  background-size: ${COVER_SIZE}px ${COVER_SIZE}px;
`;

const RoomsContainer = styled.div<{ active: boolean }>`
  position: absolute;
  z-index: 10;
  top: 0;
  left: 50%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
  translate: -50% calc(-100% + 50px);
  scale: 0.8;
  background: rgba(0, 0, 0, 0.8);
  color: ${colors.dimmed};
  font-size: 20px;
  line-height: 1.2;
  padding: 6px 12px 4px;
  border-radius: 8px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;

  ul {
    pointer-events: none;
  }

  ${(p) =>
    p.active &&
    css`
      translate: -50% 0;
      scale: 1;

      ul {
        pointer-events: all;
      }
    `}
`;

const RoomsList = styled.ul`
  display: flex;
  flex-direction: column;
`;

type RoomContainerProps = { active?: boolean };

const RoomContainer = styled.div<RoomContainerProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: ${(p) => (p.active ? colors.white : "inherit")};
`;

const Room: React.FC<React.PropsWithChildren<RoomContainerProps>> = ({
  children,
  ...props
}) => (
  <RoomContainer {...props}>
    <Icon Speaker size={20} />
    {children}
  </RoomContainer>
);

const getRoomName = (device: SonosDevice) => {
  const len = device.members.length;

  return `${device.roomName}${len > 1 ? ` +${len - 1}` : ""}`;
};

const Rooms: React.FC<{
  selectedRoom: string;
  rooms: SonosDevice[];
  setSelectedRoom: (name: string) => void;
}> = ({ selectedRoom, rooms, setSelectedRoom }) => {
  const [open, setOpen] = useState(false);

  return (
    <RoomsContainer active={open} onClick={() => setOpen(!open)}>
      <RoomsList>
        {rooms
          .filter((room) => room.roomName !== selectedRoom)
          .sort((a, b) => (a.roomName > b.roomName ? 1 : -1))
          .map((room) => (
            <li
              key={getRoomName(room)}
              onClick={() => setSelectedRoom(room.roomName)}
            >
              <Room>{getRoomName(room)}</Room>
            </li>
          ))}
        <li>
          <Room active={open}>{selectedRoom}</Room>
        </li>
      </RoomsList>
    </RoomsContainer>
  );
};

const ControlsContainer = styled.div`
  display: flex;
  position: absolute;
  width: 100%;
  left: 0;
  top: 90px;
  align-items: center;
  justify-content: center;
  gap: 80px;
  padding-top: 12px;

  button {
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 100%;
    color: ${colors.dimmed};

    svg {
      fill: currentColor;
    }
  }

  button:first-child svg {
    rotate: 180deg;
  }

  button:nth-child(2) {
    background: rgba(255, 255, 255, 0.5);
    color: ${colors.black};
  }
`;

type ControlsProps = {
  state: SonosDevice["state"]["playbackState"];
  command: (action: Exclude<SonosEmit["action"], "volume"> | number) => void;
};

const Controls: React.FC<ControlsProps> = ({ state, command }) => (
  <ControlsContainer>
    <button onClick={() => command("previous")}>
      <Icon Skip />
    </button>
    <button onClick={() => command(state === "PLAYING" ? "pause" : "play")}>
      {state === "PLAYING" ? <Icon Pause size={72} /> : <Icon Play size={72} />}
    </button>
    <button onClick={() => command("next")}>
      <Icon Skip />
    </button>
  </ControlsContainer>
);

const CoverSpacer = styled.div`
  min-height: ${COVER_SIZE + 20}px;
  background: linear-gradient(0deg, ${colors.black} 0%, rgba(0, 0, 0, 0) 30%);
  /* box-shadow: inset 0 -10px 20px 0 rgba(0, 0, 0, 1); */
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 14px;
    color: ${colors.dimmed};
  }
`;

const ProgressBarEl = styled.div`
  --progress: 0;
  height: 4px;
  position: relative;
  background: ${colors.hyperDimmed};
  flex: 1;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: ${colors.dimmed};
    scale: var(--progress) 100%;
    transform-origin: left;
  }
`;

const getPercentage = (duration: number, elapsed: number) =>
  Math.round((elapsed / duration) * 10000) / 100;

const getElapsedTime = (duration: number, elapsed: number) => {
  const z = addLeadingZero;
  const time = {
    elapsed: sec2Time(elapsed),
    left: sec2Time(duration - elapsed),
  };

  return {
    elapsed: `${z(time.elapsed.m)}:${z(time.elapsed.s)}`,
    left: `-${z(time.left.m)}:${z(time.left.s)}`,
    sec: {
      duration,
      elapsed,
    },
  };
};

const Progress: React.FC<{
  isPlaying: boolean;
  track: SonosTrack;
  elapsed: number;
}> = ({ isPlaying, track, elapsed }) => {
  const duration = track.duration;
  const [clock] = useState(() =>
    createPlaybackClock(elapsed, duration, isPlaying),
  );
  const [position, setPosition] = useState(() => clock.position());

  // Optimistic play/pause preserves the track object. A new track object comes
  // from a speaker update (or room switch) and reconciles the local clock.
  useLayoutEffect(() => {
    setPosition(clock.sync(elapsed, duration));
  }, [clock, track, elapsed, duration]);

  useLayoutEffect(() => {
    setPosition(clock.setPlaying(isPlaying));
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      const next = clock.position();
      setPosition(next);
      if (next >= track.duration) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [clock, isPlaying, track]);

  const time = getElapsedTime(duration, Math.floor(position));
  return (
    <ProgressContainer>
      <i>{time.elapsed}</i>
      <ProgressBarEl
        style={
          {
            "--progress": `${getPercentage(duration, position)}%`,
          } as React.CSSProperties
        }
      />
      <i>{time.left}</i>
    </ProgressContainer>
  );
};

const SongInfo = styled.div`
  padding-top: 8px;
  line-height: 1.3;

  h4 {
    font-weight: bold;
  }

  h5 {
    margin-top: 6px;
    color: ${colors.dimmed};
  }
`;

const VolumeContainer = styled.div`
  --volume: 0;
  position: relative;
  display: flex;
  margin: auto 0 20px;

  &:before,
  &:after {
    content: "";
    position: absolute;
    left: 0;
    width: 100%;
  }

  &:before {
    height: 4px;
    background: ${colors.hyperDimmed};
    top: 8px;
  }

  &:after {
    scale: var(--volume) 1;
    transform-origin: left;
    height: 4px;
    top: 8px;
    background: ${colors.white};
  }
`;

const VolumeSlider = styled.input`
  appearance: none;
  height: 2px;
  background: transparent;
  flex: 1;
  border-radius: 0;
  margin: 0;
  padding: 10px 0;

  &::-webkit-slider-thumb {
    appearance: none;
    position: relative;
    background: ${colors.white};
    width: 14px;
    height: 14px;
    border-radius: 50%;
  }
`;

const Volume: React.FC<{ state: number } & Pick<ControlsProps, "command">> = ({
  state,
  command,
}) => {
  const isActive = useRef(false);
  const [value, setValue] = useState(state);

  useEffect(() => {
    if (!isActive.current) setValue(state);
  }, [state]);

  const send = useThrottle({ interval: 300, finalize: true });

  const onTouch = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
    isActive.current = e.type === "touchstart";
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const volume = Number(e.target.value);
      setValue(volume);
      send(() => command(volume));
    },
    [command, send],
  );

  return (
    <VolumeContainer style={{ "--volume": `${value}%` } as React.CSSProperties}>
      <VolumeSlider
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={onChange}
        onTouchEnd={onTouch}
        onTouchStart={onTouch}
      />
    </VolumeContainer>
  );
};

const getCurrentRoom = (
  data: SonosDevice[],
  name?: string | null,
  isPlaying?: boolean,
) => {
  const predicate = ({ state, roomName }: SonosDevice) => {
    const track = state.currentTrack;
    const playback = state.playbackState;
    if (!name && isPlaying)
      return (
        playback === "PLAYING" && !track.uri?.includes("'x-sonos-htastream")
      );

    return roomName === name;
  };

  return data.find(predicate) ?? data[0]!;
};

export const Sonos: React.FC = () => {
  const [data, emit, isPlaying] = useSonosService();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // on first data and !roomName
  useEffect(() => {
    if (selectedRoom) return;

    if (data?.length)
      setSelectedRoom(getCurrentRoom(data, null, isPlaying).roomName);
  }, [data, isPlaying, selectedRoom]);

  const command: ControlsProps["command"] = useCallback(
    (action) => {
      if (!selectedRoom) return;

      const isVolume = typeof action === "number";

      const update = emit({
        roomName: selectedRoom,
        action: isVolume ? "volume" : action,
        volume: isVolume ? String(action) : undefined,
      });

      if (action === "play" || action === "pause") {
        update?.((rooms) =>
          rooms?.map((room) =>
            room.roomName === selectedRoom
              ? {
                  ...room,
                  state: {
                    ...room.state,
                    playbackState:
                      action === "play" ? "PLAYING" : "PAUSED_PLAYBACK",
                  },
                }
              : room,
          ),
        );
      }
    },
    [emit, selectedRoom],
  );

  if (!selectedRoom || !data?.length) return <Loader />;

  const current = getCurrentRoom(data, selectedRoom);

  const state = current.state;
  const track = state.currentTrack;

  return (
    <Container
      style={{
        backgroundImage: `url(${
          track.albumArtSrc ?? track.absoluteAlbumArtUri
        })`,
      }}
    >
      <Rooms
        selectedRoom={selectedRoom}
        rooms={data}
        setSelectedRoom={setSelectedRoom}
      />
      <Controls state={state.playbackState} command={command} />
      <CoverSpacer />
      {track.duration > 0 && (
        <>
          <Progress
            isPlaying={state.playbackState === "PLAYING"}
            track={track}
            elapsed={state.elapsedTime}
          />
        </>
      )}
      <SongInfo>
        <h4>{track.title || "Okänd låt"}</h4>
        <h5>
          {track.artist || "Okänd artist"} - {track.album || "Okänt album"}
        </h5>
      </SongInfo>

      <Volume state={state.volume} command={command} />
    </Container>
  );
};

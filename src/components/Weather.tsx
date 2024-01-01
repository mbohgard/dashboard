import React from "react";
import styled, { css } from "styled-components";
import dayjs, { Dayjs } from "dayjs";

import { useService } from "../hooks";
import { colors } from "../styles";

import { Loader } from "./Atoms";
import { WeatherIcon } from "./WeatherIcon";
import { SunriseIcon, SunsetIcon } from "./SunIcons";
import { getTempColor } from "../utils/color";
import type { WeatherTypes } from "../types";

type Type = {
  type?: "normal" | "big";
};

type SunData = {
  sunrise: Dayjs;
  sunriseMinutes: number;
  sunset: Dayjs;
  sunsetMinutes: number;
};

const param = (params: WeatherTypes.Parameter[], name: string) =>
  params.find((p) => p.name === name)!.values[0]!;

const minutes = (t: Dayjs) => t.minute() + t.hour() * 60;

const isNight = (time: string, { sunriseMinutes, sunsetMinutes }: SunData) => {
  const current = minutes(dayjs(time));

  return current < sunriseMinutes || current > sunsetMinutes;
};

type DegreesProps = {
  color: string;
} & Type;

const DegreesContainer = styled.div<DegreesProps>`
  font-weight: 300;
  font-size: ${({ type }) => (type === "big" ? "140px" : "48px")};
  letter-spacing: ${({ type }) => (type === "big" ? "-10px" : "-3px")};
  white-space: nowrap;
  align-self: center;
  color: ${({ color }) => color};

  > span {
    display: inline-block;
    vertical-align: baseline;
  }

  > svg {
    ${({ type }) =>
      type === "big"
        ? css`
            margin-left: 20px;
            width: 60px;
            height: 60px;
          `
        : css`
            margin-left: 8px;
            width: 20px;
            height: 20px;
          `};

    path {
      fill: ${({ color }) => color};
    }
  }
`;

type WeatherProps = {
  data: WeatherTypes.TimeSerie;
};

const Degrees: React.FC<WeatherProps & Type> = ({ data, type = "normal" }) => {
  const deg = Math.round(param(data.parameters, "t"));
  const color = getTempColor(deg);

  return (
    <DegreesContainer type={type} color={color}>
      <span>{deg}</span>
      {/* <Icon Celsius /> */}
    </DegreesContainer>
  );
};

const BigContainer = styled.div`
  display: flex;

  > svg {
    width: 200px;
    height: 200px;
    margin-right: 22px;
  }
`;

const SunData = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 40px;
  justify-content: space-evenly;

  > div:first-child {
    margin-bottom: 10px;
  }
`;

const SunTime = styled.p`
  font-weight: 300;
  color: ${colors.dimmed};
  text-align: center;
  font-size: 30px;
  margin-top: 10px;
`;

type SingleWeatherProps = WeatherProps & { sun?: SunData };

export const BigWeather: React.FC<SingleWeatherProps> = ({ data, sun }) => (
  <BigContainer>
    <WeatherIcon
      code={param(data.parameters, "Wsymb2")}
      night={sun ? isNight(data.validTime, sun) : false}
    />
    <Degrees data={data} type="big" />
    {sun && (
      <SunData>
        <div>
          <SunriseIcon />
          <SunTime>{sun.sunrise.format("HH:mm")}</SunTime>
        </div>
        <div>
          <SunsetIcon />
          <SunTime>{sun.sunset.format("HH:mm")}</SunTime>
        </div>
      </SunData>
    )}
  </BigContainer>
);

const SmallContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5px;

  > span {
    font-weight: 300;
    font-size: 28px;
    position: relative;
  }

  > svg {
    width: 68px;
    height: 68px;
    margin: 14px 0;
  }
`;

const DayOffset = styled.i<{ day: string }>`
  position: absolute;
  top: -22px;
  left: 50%;
  translate: -50%;
  font-size: 16px;
  color: ${colors.dimmed};
`;

const SmallWrapper = styled.div`
  display: flex;
  max-width: 100%;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
`;

const Small: React.FC<SingleWeatherProps & { day?: string }> = ({
  data,
  day,
  sun,
}) => (
  <SmallContainer>
    <span>
      {dayjs(data.validTime).format("HH")}
      {day && <DayOffset day={day}>{day}</DayOffset>}
    </span>
    <WeatherIcon
      code={param(data.parameters, "Wsymb2")}
      night={sun ? isNight(data.validTime, sun) : false}
    />
    <Degrees data={data} />
  </SmallContainer>
);

export const SmallWeather: React.FC<{
  data: WeatherTypes.TimeSerie[];
  sun?: SunData;
}> = ({ data, sun }) => (
  <SmallWrapper>
    {data
      .filter((t) => {
        const hour = dayjs(t.validTime).hour();

        return hour > 7 && hour < 22;
      })
      .map((t) => {
        const date = dayjs(t.validTime);

        return (
          <Small
            key={t.validTime}
            data={t}
            sun={sun}
            day={date.isToday() ? undefined : date.format("ddd")}
          />
        );
      })}
  </SmallWrapper>
);

export type Props = {
  type?: "big" | "small";
};

export const Weather: React.FC<Props> = ({ type = "small" }) => {
  const [data] = useService("weather", (res) =>
    Boolean(res.data && res.data.timeSeries)
  );

  if (!data) return <Loader />;

  const [currentWeather, ...forecast] = data.timeSeries!;
  const sunrise = data.sun && dayjs(data.sun.results?.sunrise);
  const sunset = data.sun && dayjs(data.sun.results?.sunset);

  const sun = sunrise &&
    sunset && {
      sunrise,
      sunriseMinutes: minutes(sunrise),
      sunset,
      sunsetMinutes: minutes(sunset),
    };

  return type === "small" ? (
    <SmallWeather data={forecast} sun={sun} />
  ) : (
    <BigWeather data={currentWeather!} sun={sun} />
  );
};

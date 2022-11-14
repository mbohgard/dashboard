import React from "react";
import styled, { css } from "styled-components";
import dayjs, { Dayjs } from "dayjs";
import { TinyColor } from "@ctrl/tinycolor";

import { useService } from "../hooks";
import { colors } from "../styles";
import { percentageOfRange } from "../utils/helpers";

import { Loader } from "./Atoms";
import { WeatherIcon } from "./WeatherIcon";
import { Icon } from "./Icon";
import { SunriseIcon, SunsetIcon } from "./SunIcons";

type Type = {
  type?: "normal" | "big";
};

type SunData = {
  sunrise: Dayjs;
  sunriseMinutes: number;
  sunset: Dayjs;
  sunsetMinutes: number;
};

const percentage = percentageOfRange(-15, 30);

const param = (params: Parameter[], name: string) =>
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
  data: TimeSerie;
};

const Degrees: React.FC<WeatherProps & Type> = ({ data, type = "normal" }) => {
  const deg = Math.round(param(data.parameters, "t"));
  const color = new TinyColor(colors.cold)
    .mix(new TinyColor(colors.hot), percentage(deg))
    .toHsv();
  const boosted = new TinyColor({
    ...color,
    v: 1,
  }).toString("hex6") as string;

  return (
    <DegreesContainer type={type} color={boosted}>
      <span>{deg}</span>
      <Icon Celsius />
    </DegreesContainer>
  );
};

const BigContainer = styled.div`
  display: flex;
  margin-right: 20px;

  > svg {
    width: 220px;
    height: 220px;
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

  > span {
    font-weight: 300;
    font-size: 28px;
  }

  > svg {
    width: 76px;
    height: 76px;
    margin: 18px 0;
  }
`;

const SmallWrapper = styled.div`
  display: flex;
  max-width: 100%;
  width: 100%;
  justify-content: space-between;
`;

const Small: React.FC<SingleWeatherProps> = ({ data, sun }) => {
  return (
    <SmallContainer>
      <span>{dayjs(data.validTime).format("HH:mm")}</span>
      <WeatherIcon
        code={param(data.parameters, "Wsymb2")}
        night={sun ? isNight(data.validTime, sun) : false}
      />
      <Degrees data={data} />
    </SmallContainer>
  );
};

export const SmallWeather: React.FC<{ data: TimeSerie[]; sun?: SunData }> = ({
  data,
  sun,
}) => (
  <SmallWrapper>
    {data
      .filter((x) => {
        const hour = dayjs(x.validTime).hour();

        return hour > 7 && hour < 22;
      })
      .filter((_, ix) => ix < 10)
      .map((t) => (
        <Small key={t.validTime} data={t} sun={sun} />
      ))}
  </SmallWrapper>
);

export type Props = {
  type?: "big" | "small";
};

export const Weather: React.FC<Props> = ({ type = "small" }) => {
  const [data] = useService<WeatherServiceData>("weather", (res) =>
    Boolean(res.data && res.data.timeSeries)
  );

  if (!data) return <Loader />;

  const [currentWeather, ...forecast] = data.timeSeries!;
  const sunrise = data.sun && dayjs(data.sun.results.sunrise);
  const sunset = data.sun && dayjs(data.sun.results.sunset);

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

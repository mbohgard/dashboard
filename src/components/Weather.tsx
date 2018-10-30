import * as React from "react";
import styled, { css } from "styled-components";
import dayjs from "dayjs";

import { CommonProps } from "../main";
import { WeatherIcon } from "./WeatherIcon";
import { celsius } from "./Icon";

type Type = {
  type?: "normal" | "big";
};

const param = (params: Parameter[], name: string) =>
  params.find(p => p.name === name)!.values[0];

const DegreesContainer = styled.div`
  font-weight: 300;
  font-size: ${({ type }: Type) => (type === "big" ? "100px" : "32px")};
  letter-spacing: ${({ type }: Type) => (type === "big" ? "-10px" : "-3px")};
  white-space: nowrap;

  > span {
    display: inline-block;
    vertical-align: baseline;
  }

  > svg {
    ${({ type }: Type) =>
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
  }
`;

type WeatherProps = {
  data: TimeSerie;
};

const Degrees: React.SFC<WeatherProps & Type> = ({ data, type = "normal" }) => (
  <DegreesContainer type={type}>
    <span>{Math.round(param(data.parameters, "t"))}</span>
    {celsius}
  </DegreesContainer>
);

const BigContainer = styled.div`
  display: flex;
  align-items: center;

  > svg {
    width: 180px;
    height: 180px;
    margin-right: 22px;
  }
`;

export const BigWeather: React.SFC<WeatherProps> = ({ data }) => {
  return (
    <BigContainer>
      <WeatherIcon
        code={param(data.parameters, "Wsymb2")}
        time={data.validTime}
      />
      <Degrees data={data} type="big" />
    </BigContainer>
  );
};

const SmallContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > span {
    font-weight: 300;
    font-size: 18px;
  }

  > svg {
    width: 50px;
    height: 50px;
    margin: 10px 0;
  }
`;

const SmallWrapper = styled.div`
  display: flex;
  max-width: 100%;
  width: 100%;
  justify-content: space-between;
  margin-top: 20px;
`;

const Small: React.SFC<WeatherProps> = ({ data }) => {
  return (
    <SmallContainer>
      <span>{dayjs(data.validTime).format("HH:mm")}</span>
      <WeatherIcon
        code={param(data.parameters, "Wsymb2")}
        time={data.validTime}
      />
      <Degrees data={data} />
    </SmallContainer>
  );
};

export const SmallWeather: React.SFC<{ data: TimeSerie[] }> = ({ data }) => (
  <SmallWrapper>
    {data
      .filter(x => {
        const hour = dayjs(x.validTime).hour();

        return hour > 7 && hour < 22;
      })
      .filter((_, ix) => ix < 10)
      .map(t => (
        <Small key={t.validTime} data={t} />
      ))}
  </SmallWrapper>
);

export type Props = {
  type?: "big" | "small";
} & CommonProps;

type State = {
  data?: Forecast;
};

export class Weather extends React.Component<Props, State> {
  state: State = {};

  componentDidMount() {
    this.props.socket.on(
      "weather",
      (res: WeatherServiceData) =>
        res.data
          ? this.setState({ data: res.data })
          : this.props.reportError(res.service, res.error)
    );
  }

  componentDidCatch(err: any) {
    this.props.reportError("catch in Weather", err);
  }

  render() {
    const { type = "small" } = this.props;
    const { data } = this.state;
    let currentWeather, forecast;

    if (data) {
      [currentWeather, ...forecast] = data.timeSeries;
    } else {
      return <div>Väntar på väderdata...</div>;
    }

    return type === "small" ? (
      <SmallWeather data={forecast} />
    ) : (
      <BigWeather data={currentWeather} />
    );
  }
}

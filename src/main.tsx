import * as React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import "dayjs/locale/sv";

import { baseStyles } from "./styles";

import { BigWeather, SmallWeather } from "./components/Weather";
import { Time } from "./components/Time";
import { Buses } from "./components/Buses";

import { min2Ms } from "./utils/time";

dayjs.locale("sv");

baseStyles();

const Wrapper = styled.div`
  padding: 40px;
  max-height: 100%;
  height: 100%;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
`;

type HalfProps = {
  right?: boolean;
  top?: boolean;
};

const Half = styled.div`
  width: 50%;
  display: flex;
  align-items: ${({ top }: HalfProps) => (top ? "flex-start" : "center")};
  justify-content: ${({ right }: HalfProps) =>
    right ? "flex-end" : "flex-start"};
`;

type WholeProps = {
  left?: boolean;
  right?: boolean;
  last?: boolean;
};

const Whole = styled(Half)`
  width: 100%;
  justify-content: ${({ left, right }: WholeProps) =>
    left ? "flex-start" : right ? "flex-start" : "center"};
  align-items: ${({ last }: WholeProps) => (last ? "flex-end" : "normal")};
`;

type State = {
  weatherError?: any;
  weatherData?: Forecast;
};

class App extends React.Component {
  state: State = {};

  timer: NodeJS.Timer;

  getData = () =>
    fetch("/weather")
      .then(res => res.json())
      .then(data =>
        this.setState({ weatherData: data, weatherError: undefined })
      )
      .catch(error => this.setState({ weatherError: error }));

  fetcher = () => {
    this.getData();

    this.timer = setTimeout(this.fetcher, min2Ms(15));
  };

  componentDidMount() {
    this.fetcher();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const weather = this.state.weatherData;
    let currentWeather, forecast;

    if (weather) {
      [currentWeather, ...forecast] = weather.timeSeries;
    }

    return (
      <Wrapper>
        <Container>
          <Half top>
            {currentWeather && <BigWeather data={currentWeather} />}
          </Half>
          <Half right top>
            <Time />
          </Half>
          <Whole>{forecast && <SmallWeather data={forecast} />}</Whole>
          <Whole left last>
            <Buses />
          </Whole>
        </Container>
      </Wrapper>
    );
  }
}

render(<App />, document.getElementById("app"));

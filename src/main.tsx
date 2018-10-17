import * as React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import "dayjs/locale/sv";

import { baseStyles } from "./styles";

import { BigWeather, SmallWeather } from "./components/Weather";
import { Time } from "./components/Time";
import { Transports } from "./components/Transports";

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

const ErrorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
`;

const ErrorBox = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #bf2f2f;
  padding: 20px;
`;

type State = {
  weatherData?: Forecast;
  error?: Error;
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
      .catch(error => this.setState({ error }));

  fetcher = () => {
    this.getData();

    this.timer = setTimeout(this.fetcher, min2Ms(15));
  };

  reportError = (error: Error) => this.setState({ error });

  componentDidMount() {
    this.fetcher();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const weather = this.state.weatherData;
    const err = this.state.error;
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
            <Time reportError={this.reportError} />
          </Half>
          <Whole>{forecast && <SmallWeather data={forecast} />}</Whole>
          <Whole last>
            <Transports reportError={this.reportError} />
          </Whole>
        </Container>
        {err && (
          <ErrorContainer>
            <ErrorBox>
              {err.name}: {err.message} {console.dir(err)}
            </ErrorBox>
          </ErrorContainer>
        )}
      </Wrapper>
    );
  }
}

render(<App />, document.getElementById("app"));

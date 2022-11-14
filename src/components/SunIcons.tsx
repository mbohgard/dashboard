import * as React from "react";
import styled, { css } from "styled-components";

import { colors } from "../styles";

import { Svg } from "./Atoms";

const arrow = (
  <Svg viewBox="0 0 240.823 240.823">
    <path
      d="M183.189,111.816L74.892,3.555c-4.752-4.74-12.451-4.74-17.215,0c-4.752,4.74-4.752,12.439,0,17.179
		l99.707,99.671l-99.695,99.671c-4.752,4.74-4.752,12.439,0,17.191c4.752,4.74,12.463,4.74,17.215,0l108.297-108.261
		C187.881,124.315,187.881,116.495,183.189,111.816z"
    />
  </Svg>
);

const sunrise = (
  <Svg>
    <path
      d="M31.15,8.345c-0.021,1.266-1.266,2.292-2.807,2.292c-1.537,0-2.781-1.026-2.805-2.292h-0.017l0.015-0.024l-0.001-0.006
	c0-0.819,2.099-4.27,2.808-4.257c0.711,0.008,2.809,3.438,2.809,4.257v0.006l0.018,0.024H31.15z M48.27,31.093l0.025-0.016
	c0,0,0.004,0,0.008,0c0.818,0,4.248-2.098,4.256-2.809c0.01-0.711-3.438-2.808-4.256-2.808c-0.004,0-0.008,0.001-0.008,0.001
	l-0.025-0.016v0.018c-1.264,0.021-2.289,1.268-2.289,2.805c0,1.54,1.025,2.786,2.289,2.807V31.093z M8.421,25.446l-0.025,0.018
	c-0.001,0-0.004,0-0.006,0c-0.818,0-4.25,2.097-4.258,2.808c-0.011,0.71,3.439,2.81,4.258,2.81c0.002,0,0.005-0.002,0.006-0.002
	l0.025,0.014v-0.016c1.266-0.023,2.291-1.27,2.291-2.806c0-1.54-1.025-2.784-2.291-2.806V25.446z M16.252,12.185l-0.027-0.006
	c-0.001-0.003-0.004-0.005-0.005-0.005c-0.579-0.579-4.488-1.521-4.997-1.025c-0.51,0.496,0.446,4.418,1.024,4.997
	c0.004,0.002,0.004,0.002,0.007,0.004l0.007,0.026l0.01-0.01c0.912,0.88,2.518,0.723,3.605-0.364
	c1.088-1.089,1.243-2.693,0.363-3.603L16.252,12.185z M44.43,16.176l0.006-0.026c0.004-0.001,0.006-0.004,0.008-0.006
	c0.576-0.578,1.52-4.488,1.021-4.997c-0.494-0.508-4.416,0.446-4.994,1.025c-0.004,0.002-0.004,0.004-0.004,0.008l-0.027,0.006
	l0.01,0.01c-0.879,0.912-0.723,2.517,0.365,3.604c1.088,1.089,2.691,1.243,3.602,0.363L44.43,16.176z M48.162,37.705
	c0-0.553-0.447-1-1-1h-36.25c-0.553,0-1,0.447-1,1s0.447,1,1,1h36.25C47.715,38.705,48.162,38.258,48.162,37.705z M44.912,42.348
	c0-0.553-0.447-1-1-1h-37.5c-0.553,0-1,0.447-1,1s0.447,1,1,1h37.5C44.465,43.348,44.912,42.9,44.912,42.348z M50.287,46.991
	c0-0.553-0.447-1-1-1h-29.25c-0.553,0-1,0.447-1,1s0.447,1,1,1h29.25C49.84,47.991,50.287,47.544,50.287,46.991z M47.912,51.634
	c0-0.553-0.447-1-1-1h-29.5c-0.553,0-1,0.447-1,1s0.447,1,1,1h29.5C47.465,52.634,47.912,52.187,47.912,51.634z M28.346,15.977
	c-6.779,0-12.294,5.514-12.294,12.292c0,1.175,0.166,2.33,0.494,3.448h23.598c0.328-1.117,0.492-2.271,0.492-3.448
	C40.637,21.491,35.123,15.977,28.346,15.977 M28.346,13.977c7.894,0,14.291,6.398,14.291,14.292c0,1.93-0.387,3.768-1.08,5.448
	H15.133c-0.693-1.68-1.081-3.518-1.081-5.448C14.052,20.375,20.453,13.977,28.346,13.977L28.346,13.977z"
    />
  </Svg>
);

const fill = css<Props>`
  path {
    fill: ${({ color }) => color} !important;
  }
`;

const Wrapper = styled.div`
  height: 50px;
`;

const SunWrapper = styled.div<Props>`
  overflow: hidden;
  height: 40px;
  text-align: center;

  > svg {
    height: 80px;
    width: 80px;
    ${fill}
  }
`;

const ArrowWrapper = styled.div<Props>`
  text-align: center;
  position: relative;
  top: -4px;

  > svg {
    transform: rotate(${({ down }) => (down ? "90deg" : "-90deg")});
    height: 22px;
    width: 22px;
    ${fill}
  }
`;

type Props = { down?: boolean; color: string };

const Icon = (props: Props) => (
  <Wrapper>
    <SunWrapper {...props}>{sunrise}</SunWrapper>
    <ArrowWrapper {...props}>{arrow}</ArrowWrapper>
  </Wrapper>
);

export const SunriseIcon = () => <Icon color={colors.yellow} />;
export const SunsetIcon = () => <Icon color={colors.orange} down />;

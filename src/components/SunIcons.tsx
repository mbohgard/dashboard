import * as React from "react";
import styled from "styled-components";

import { arrow, sunrise } from "./Icon";

const Wrapper = styled.div`
  height: 50px;
`;

const SunWrapper = styled.div`
  overflow: hidden;
  height: 30px;
  text-align: center;

  > svg {
    height: 60px;
    width: 60px;
  }
`;

const ArrowWrapper = styled.div<Props>`
  text-align: center;
  position: relative;
  top: -4px;

  > svg {
    transform: rotate(${({ down }) => (down ? "90deg" : "-90deg")});
    height: 15px;
    width: 15px;
  }
`;

type Props = { down?: boolean };

const Icon: React.SFC<Props> = ({ down }) => (
  <Wrapper>
    <SunWrapper>{sunrise}</SunWrapper>
    <ArrowWrapper down={down}>{arrow}</ArrowWrapper>
  </Wrapper>
);

export const SunriseIcon = () => <Icon />;
export const SunsetIcon = () => <Icon down />;

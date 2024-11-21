import React from "react";
import styled from "styled-components";

import { useService } from "../../../hooks";
import { colors } from "../../../styles";

const Container = styled.div`
  font-size: 20px;
  color: ${colors.dimmed};
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  text-transform: capitalize;

  > div {
    display: flex;
    align-items: center;
    gap: 5px;

    svg {
      color: ${colors.babyblue};
    }

    &:last-child {
      svg {
        color: ${colors.pink};
      }
    }
  }

  svg {
    width: 30px;
    height: 30px;

    path,
    line {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-miterlimit: 10;
    }
  }
`;

const girl = (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 32 32"
  >
    <path d="M11.2,21c0.4,1.2,1.5,2,2.8,2" />
    <line x1="13" y1="17" x2="13" y2="19" />
    <line x1="19" y1="17" x2="19" y2="19" />
    <path d="M16,7L9.2,2.9l0,0c-1.6,2.5-1.6,5.7,0,8.1l0,0l13.5-8.1l0,0c1.6,2.5,1.6,5.7,0,8.1l0,0L16,7" />
    <path
      d="M8.3,9.1c-1.4,1.3-2.4,3-2.9,4.9C4,14.3,3,15.5,3,17c0,1.5,1,2.7,2.4,2.9C6.7,24.6,10.9,28,16,28
	s9.3-3.4,10.6-8.1C28,19.7,29,18.5,29,17c0-1.5-1-2.7-2.4-2.9c-0.5-1.9-1.5-3.6-2.9-4.9"
    />
    <path d="M20.3,9.6c0,0.1,0.1,0.1,0.1,0.2c0.8,1.3,0.4,3.1-0.9,3.9c-1.1,0.7-2.5,0.3-3.2-0.8" />
    <path d="M15.9,7.3c0.1,0,0.1,0.1,0.2,0.1c1.3,1,1.7,2.9,0.8,4.3c-0.7,1.1-2.1,1.4-3.2,0.6" />
  </svg>
);

const boy = (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 32 32"
  >
    <path d="M11.2,21c0.4,1.2,1.5,2,2.8,2" />
    <line x1="13" y1="17" x2="13" y2="19" />
    <line x1="19" y1="17" x2="19" y2="19" />
    <path
      d="M17.9,3.3c2.3,1.9,3.1,5.2,1.7,7.9c-1.3,2.5-4.4,3.4-6.8,2.1c-2-1-2.7-3.5-1.7-5.5c0.8-1.6,2.8-2.2,4.4-1.4
	c1.3,0.7,1.8,2.2,1.1,3.5"
    />
    <path
      d="M11.9,6.8c-3.2,1.3-5.6,4-6.5,7.3C4,14.3,3,15.5,3,17c0,1.5,1,2.7,2.4,2.9C6.7,24.6,10.9,28,16,28
	s9.3-3.4,10.6-8.1C28,19.7,29,18.5,29,17c0-1.5-1-2.7-2.4-2.9c-0.9-3.3-3.3-6-6.5-7.3"
    />
  </svg>
);

export const NameDay = () => {
  const [data] = useService("dayinfo");

  return data ? (
    <Container>
      {data.names.map(({ name, gender }) => (
        <div key={name}>
          {gender === "male" ? boy : girl} <span>{name}</span>
        </div>
      ))}
    </Container>
  ) : null;
};

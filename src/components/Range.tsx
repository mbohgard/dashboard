import React, { useState, useRef } from "react";
import styled from "styled-components";

type Color = {
  color: string;
};

type Value = {
  value: number;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 80px 0;
  align-items: center;
`;

const Value = styled.h3<Color>`
  font-size: 50px;
  color: ${p => p.color};
  text-align: center;
  margin-bottom: 20px;
`;

const SliderContainer = styled.div`
  flex-grow: 1;
  background: #222;
  display: flex;
  width: 100px;
  flex-direction: column;
  flex-flow: column-reverse;
`;

const SliderFill = styled.div<Color & Value>`
  background: ${p => p.color};
  height: ${p => p.value}%;
`;

const Slider: React.FC<{
  onChange(value: number): void;
} & Color &
  Value> = ({ color, onChange, value }) => {
  const el = useRef<HTMLDivElement>(null);

  const getPercentage = (y: number) => {
    const elHeight = el.current!.clientHeight;
    const elBottom = el.current!.offsetTop + elHeight;
    const pos = elBottom - y;

    if (pos < 0) return 0;

    if (pos > elHeight) return 100;

    return Math.round((pos / elHeight) * 100);
  };

  const change = (e: React.TouchEvent) =>
    onChange(getPercentage(e.touches[0].pageY));

  return (
    <SliderContainer
      ref={el}
      onTouchStart={change}
      onTouchMove={change}
      onClick={e => e.stopPropagation()}
    >
      <SliderFill color={color} value={value} />
    </SliderContainer>
  );
};

type Props = {
  initialValue?: number;
  onChange?(value: number): void;
} & Partial<Color>;

export const Range: React.FC<Props> = ({
  color = "white",
  initialValue = 0,
  onChange
}) => {
  const [value, setValue] = useState(initialValue);

  const change = (value: number) => {
    setValue(value);
    onChange?.(value);
  };

  return (
    <Container>
      <Value color={color}>{value}</Value>
      <Slider color={color} onChange={change} value={value}></Slider>
    </Container>
  );
};

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  height: 100%;
  position: relative;

  &::before,
  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    height: 100%;
    width: 30px;
    background: linear-gradient(to right, #000, rgba(0, 0, 0, 0));
    transition: opacity 0.3s;
  }

  &::before {
    opacity: 0;
    left: 0;
  }

  &::after {
    opacity: 1;
    right: 0;
    rotate: 180deg;
  }

  &.scrolled::before {
    opacity: 1;
  }

  &.at-end::after {
    opacity: 0;
  }
`;

const Inner = styled.div`
  height: 100%;
  overflow-x: scroll;
`;

export const Scrollable: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => {
  const inner = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState(0);

  useEffect(() => {
    let timer: number;
    const listener = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        inner.current?.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }, 10000);

      const el = inner.current!;
      const x = el.scrollLeft;
      const atEnd = el.scrollWidth - x <= el.clientWidth + 1;

      setScrollState(!!x && atEnd ? 2 : !!x && !atEnd ? 1 : 0);
    };

    inner?.current?.addEventListener("scroll", listener);

    return () => {
      inner?.current?.removeEventListener("scroll", listener);
    };
  }, []);

  return (
    <Container
      className={`${className} ${
        scrollState === 2
          ? "scrolled at-end"
          : scrollState === 1
            ? "scrolled"
            : ""
      }`}
    >
      <Inner ref={inner}>{children}</Inner>
    </Container>
  );
};

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { colors } from "../styles";
import { Icon } from "./Icon";

const Container = styled.div<{
  active: boolean;
  position: Position;
}>`
  position: relative;
  display: flex;

  button {
    color: ${(p) => (p.active ? colors.white : colors.dimmed)};
  }

  ul {
    position: absolute;
    left: 0;
    top: ${(p) => (p.position === "below" ? "100%" : "auto")};
    bottom: ${(p) => (p.position === "above" ? "100%" : "auto")};
    display: ${(p) => (p.active ? "block" : "none")};
  }
`;

const Select = styled.button`
  background: ${colors.black};
  border: solid 3px ${colors.superDimmed};
  border-radius: 8px;
  padding: 8px;
  display: flex;
  gap: 20px;
  font-size: 16px;
  align-items: center;

  svg {
    fill: currentColor;
  }
`;

type Position = "above" | "below";

type DropdownProps = {
  position?: Position;
  items?: Array<{
    label: string;
    value: string;
  }>;
  defaultValue?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({
  position = "below",
  items = [],
  defaultValue,
}) => {
  const [selected, setSelected] = useState(
    defaultValue ?? items[0]?.value ?? null
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const listener = () => setActive(false);

    window.setTimeout(() => document.addEventListener("click", listener));

    return () => document.removeEventListener("click", listener);
  }, [active]);

  return (
    <Container position={position} active={active}>
      <Select type="button" onClick={() => setActive((s) => !s)}>
        {selected}
        <Icon Caret size={20} />
      </Select>
      <ul>
        {items.map(({ label, value }) => (
          <li key={value} onClick={() => setSelected(value)}>
            {label}
          </li>
        ))}
      </ul>
    </Container>
  );
};

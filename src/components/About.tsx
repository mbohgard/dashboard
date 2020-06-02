import React, { useState } from "react";
import styled from "styled-components";

import { Overlay } from "./Molecules";

const Trigger = styled.a`
  position: fixed;
  width: 60px;
  height: 60px;
  top: 0;
  right: 0;
  background: transparent;
  z-index: 99;
`;

type Props = {
  version?: string;
};

export const About: React.FC<Props> = ({ version }) => {
  const [show, setShow] = useState(false);

  return show ? (
    <Overlay closeOnPress autoClose={5000} close={() => setShow(false)}>
      {version}
    </Overlay>
  ) : (
    <Trigger onClick={() => setShow(true)} />
  );
};

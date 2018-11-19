import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

export const BaseStyles = createGlobalStyle`
  ${reset}
  
  html {
    box-sizing: border-box;
    font-family: "Open Sans", Helvetica, Arial, sans-serif;
    height: 100%;
    max-height: 100%;
  }
  
  *, *:before, *:after {
    box-sizing: inherit;
    font: inherit;
  }

  body {
      background: #222;
      color: #fff;
      height: 100%;
  }

  #app {
    max-height: 100%;
    height: 100%;
  }
`;

import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

export const colors = {
  white: "#fff",
  gray: "#aaa",
  orange: "#ff9647",
  dimmed: "#aaa",
  superDimmed: "#666",
  ultraDimmed: "#444",
  yellow: "#ffda47",
  cold: "#00c3f9",
  hot: "#ff3700",
  red: "#bf2f2f"
};

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
      background: #000;
      color: #fff;
      height: 100%;
  }

  #app {
    max-height: 100%;
    height: 100%;
  }
`;

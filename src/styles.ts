import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

export const colors = {
  white: "#fff",
  black: "#000",
  gray: "#aaa",
  lightGray: "#eee",
  orange: "#ff9647",
  dimmed: "#aaa",
  superDimmed: "#666",
  ultraDimmed: "#444",
  hyperDimmed: "#222",
  yellow: "#ffda47",
  cold: "#00c3f9",
  hot: "#ff3700",
  red: "#bf2f2f",
  green: "#55cb3c",
  blue: "#2f92d4",
  purple: "#cf449a",
};

export type Colors = keyof typeof colors;

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
    user-select:none;
    font: inherit;
    -webkit-tap-highlight-color:  transparent; 
  }

  body {
      background: #000;
      color: #fff;
      height: 100%;
      overscroll-behavior: none;
  }

  #app {
    max-height: 100%;
    height: 100%;
  }
`;

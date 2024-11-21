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
  megaDimmed: "#333",
  hyperDimmed: "#222",
  yellow: "#ffda47",
  cold: "#00c3f9",
  hot: "#ff3700",
  red: "#bf2f2f",
  green: "#55cb3c",
  blue: "#2f92d4",
  purple: "#a144cf",
  magenta: "#cf449a",
  danger: "#f02c0a",
  warning: "#faac11",
  babyblue: "#a1c3f9",
  pink: "#f9a1c3",
} as const;

export type Colors = keyof typeof colors;

export const BaseStyles = createGlobalStyle`
  ${reset}
  
  html {
    box-sizing: border-box;
    font-family: "Open Sans", Helvetica, Arial, sans-serif;
  }
  
  *, *:before, *:after {
    box-sizing: border-box;
    user-select:none;
    font: inherit;
    -webkit-tap-highlight-color:  transparent; 
  }

  body {
      background: #000;
      color: #fff;
      overscroll-behavior: none;
  }

  #app {
    height: 100vh;
    overflow-y: hidden;
  }
`;

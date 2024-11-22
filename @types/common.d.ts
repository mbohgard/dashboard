declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "../assets/icons/*.svg" {
  const content: React.FC;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

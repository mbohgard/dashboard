declare module "*.svg" {
  const content: React.FC;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

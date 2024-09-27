declare module "*.svg" {
  const content: React.FC;
  export default content;
}

declare interface LightConfig {
  calendar?: {
    label: string;
  };
  voc?: {
    label: string;
  };
  food?: {
    label: string;
  };
  temp?: {
    label: string;
  };
}

declare module "*.png" {
  const content: string;
  export default content;
}

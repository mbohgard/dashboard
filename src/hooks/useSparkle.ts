import { useCallback, useRef } from "react";
import { colors } from "../styles";
import { rand, swtch } from "../utils/helpers";

const flares = ["✦", "❤︎", "✶", "●"];

const getTranslatePos = () => rand(-40, 40, (x) => x <= -10 || x >= 10);

const flareStyle = `
  position: absolute;
  scale: 0;
  font-size: 30px;
  transition: all ease-out;
  pointer-events: none;
  z-index: 99;
`;

const wrapperStyle = `
  position: absolute;
  width: 1px;
  height: 1px;
  pointer-events: none;
  z-index: 99;
`;

const popStyle = `
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  transition: all cubic-bezier(.01,.23,0,.99);
`;

const starColors = [colors.red, colors.orange, colors.yellow, colors.green];

type SparkleArgs = {
  x: number;
  y: number;
  onDone: ({
    container,
    color,
  }: {
    container: HTMLElement;
    color: string;
    fx: number;
    fy: number;
  }) => void;
};

const sparkle = ({ x, y, onDone }: SparkleArgs) => {
  const items = Array(rand(6, 8))
    .fill(0)
    .map(() => {
      const particle = flares[rand(0, flares.length - 1)]!;

      const el = document.createElement("span");
      const translate = [getTranslatePos(), getTranslatePos()];
      const duration = rand(250, 600);
      const scale = String(rand(5, 15) / 10);
      const color = starColors[rand(0, starColors.length - 1)]!;

      el.style.cssText = `
      ${flareStyle}
      left: ${x}px;
      top: ${y}px;
      color: ${color};
      transition-duration: ${duration}ms;
      scale: scale(${scale});
    `;

      el.innerHTML = particle;

      return { el, color, translate, duration, scale };
    });

  const container = document.getElementById("app")!;
  container.append(...items.map(({ el }) => el));

  setTimeout(() => {
    for (const { el, translate: t, duration, scale, color } of items) {
      el.style.scale = scale;
      el.style.translate = `${t[0]}px ${t[1]}px`;

      setTimeout(() => {
        const { x, y } = el.getBoundingClientRect();
        onDone({ container, color, fx: x, fy: y });

        el.remove();
      }, duration);
    }
  });
};

const PARTICLE_DURATION = 200;

const getParticle = (color: string, n: number) => {
  const particle = document.createElement("i");

  particle.style.cssText = `
    ${popStyle};
    background: ${color};
    transition-duration: ${PARTICLE_DURATION}ms;
  `;

  const px = swtch(n, [1, -10], [2, 10]) ?? 0;
  const py = swtch(n, [1, -10], [2, -10]) ?? 10;

  const translate = [px, py];

  return { el: particle, translate };
};

type PopArgs = {
  x: number;
  y: number;
  color: string;
  container: HTMLElement;
};

const pop = ({ x, y, color, container }: PopArgs) => {
  const wrapper = document.createElement("div");
  const particles = [
    getParticle(color, 1),
    getParticle(color, 2),
    getParticle(color, 3),
  ];

  wrapper.style.cssText = `
    ${wrapperStyle};
    rotate: ${rand(0, 360)}deg;
    left: ${x}px;
    top: ${y}px;
    `;

  wrapper.append(...particles.map(({ el }) => el));
  container.append(wrapper);

  setTimeout(() => {
    for (const { el, translate: t } of particles) {
      el.style.translate = `${t[0]}px ${t[1]}px`;

      setTimeout(() => wrapper.remove(), PARTICLE_DURATION);
    }
  }, 25); // somehow no duration does not work...
};

export const useSparkle = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);

  const run = useCallback(() => {
    if (!ref.current) return;

    const target = ref.current;
    const { x, y } = target.getBoundingClientRect();

    sparkle({
      x,
      y,
      onDone: ({ container, color, fx, fy }) =>
        pop({ x: fx, y: fy, color, container }),
    });
  }, []);

  return { ref, sparkle: run };
};

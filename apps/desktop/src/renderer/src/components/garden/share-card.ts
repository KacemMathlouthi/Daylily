import type { FlowerColor } from "@daylily/core/flower";
import { PETAL } from "@daylily/ui/components/daylily-mark";
import { bloomScale, isFlower } from "@daylily/ui/components/garden";
import meadow from "../../assets/meadow.jpg";
import { dateFormat } from "../../lib/format";
import type { GardenGrid } from "../../lib/garden";

export interface ShareCardData {
  /** `YYYY-MM`, so the current month is marked, as on screen. */
  currentMonth: string;
  flowers: number;
  fullestMonth: Date | null;
  grid: GardenGrid;
  /** Whether the year shown is this one: "this year" or "in 2025". */
  isThisYear: boolean;
  /** "Kacem’s garden", or "My garden" without a name. */
  title: string;
  words: number;
  year: number;
}

/** Paper's "06c Garden · share image": a 1080 square, drawn at twice that for sharp sharing. */
const SIZE = 1080;
const SCALE = 2;
const PAD = 72;
const INNER = SIZE - PAD * 2;
const ANGLES = [0, 60, 120, 180, 240, 300];
const MEADOW_HEIGHT = 330;

const MONTH_SHORT = dateFormat({ month: "short" });
const MONTH_LONG = dateFormat({ month: "long" });
const NUMBER = new Intl.NumberFormat("en");

const TOKENS = [
  "paper-raised",
  "paper-page",
  "paper-tint",
  "line",
  "line-strong",
  "ink",
  "ink-muted",
  "ink-subtle",
  "ink-faint",
  "soil",
  "daylily",
  "saffron",
  "petal",
  "cornflower",
] as const;
type Token = (typeof TOKENS)[number];

/** The light palette and fonts from the design tokens: the card is always light, like paper. */
function readTheme() {
  const probe = document.createElement("div");
  probe.className = "light";
  probe.hidden = true;
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const color = Object.fromEntries(
    TOKENS.map((token) => [token, style.getPropertyValue(`--${token}`).trim()])
  ) as Record<Token, string>;
  const font = {
    display: style.getPropertyValue("--font-display").trim(),
    sans: style.getPropertyValue("--font-sans").trim(),
    writing: style.getPropertyValue("--font-writing").trim(),
  };
  probe.remove();
  return { color, font };
}

type Theme = ReturnType<typeof readTheme>;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string
) {
  const petal = new Path2D(PETAL);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.fillStyle = fill;
  for (const angle of ANGLES) {
    ctx.save();
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fill(petal);
    ctx.restore();
  }
  ctx.restore();
}

function dot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Sets a font, shrinking it until the text fits `width`. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (size: number) => string,
  size: number,
  width: number
) {
  let current = size;
  ctx.font = font(current);
  while (current > 12 && ctx.measureText(text).width > width) {
    current -= 2;
    ctx.font = font(current);
  }
  return current;
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  { color, font }: Theme,
  data: ShareCardData
) {
  drawFlower(ctx, PAD + 15, PAD + 15, 30, color.daylily);
  ctx.font = `600 20px ${font.sans}`;
  ctx.fillStyle = color["ink-subtle"];
  ctx.textBaseline = "middle";
  ctx.fillText(String(data.year), PAD + 42, PAD + 16);

  ctx.textBaseline = "top";
  ctx.fillStyle = color.ink;
  ctx.letterSpacing = "-2.8px";
  fitFont(ctx, data.title, (size) => `${size}px ${font.display}`, 96, INNER);
  ctx.fillText(data.title, PAD, PAD + 44);
  ctx.letterSpacing = "0px";

  ctx.font = `italic 26px ${font.writing}`;
  ctx.fillStyle = color["ink-muted"];
  ctx.fillText(
    "Every flower is a day I wrote. Bare soil is a day I rested.",
    PAD,
    PAD + 150
  );
  return PAD + 150 + 34 + 40;
}

function drawGraph(
  ctx: CanvasRenderingContext2D,
  { color, font }: Theme,
  data: ShareCardData,
  top: number
) {
  const { grid } = data;
  const cell = (INNER - 56) / grid.columns;
  const height = 26 + 15 + 12 + cell * 7 + 24;
  const left = PAD + 28;

  ctx.beginPath();
  ctx.roundRect(PAD, top, INNER, height, 24);
  ctx.fillStyle = color["paper-page"];
  ctx.fill();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textBaseline = "top";
  for (const { column, date } of grid.months) {
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = month === data.currentMonth;
    ctx.font = `${current ? 600 : 400} 15px ${font.sans}`;
    ctx.fillStyle = current ? color.ink : color["ink-faint"];
    ctx.fillText(MONTH_SHORT.format(date), left + column * cell, top + 26);
  }

  const gridTop = top + 26 + 15 + 12;
  for (const [index, day] of grid.cells.entries()) {
    const x = left + Math.floor(index / 7) * cell + cell / 2;
    const y = gridTop + (index % 7) * cell + cell / 2;
    if (isFlower(day)) {
      const fill = color[day.color satisfies FlowerColor];
      drawFlower(ctx, x, y, cell * bloomScale(day.words), fill);
    } else if (day === null) {
      dot(ctx, x, y, cell * 0.09, color.soil);
    } else if (day === "upcoming") {
      dot(ctx, x, y, cell * 0.07, color["line-strong"]);
    }
    if (index === grid.todayIndex) {
      ctx.beginPath();
      ctx.arc(x, y, cell * 0.47, 0, Math.PI * 2);
      ctx.strokeStyle = color.daylily;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  return top + height + 40;
}

function drawStats(
  ctx: CanvasRenderingContext2D,
  { color, font }: Theme,
  data: ShareCardData,
  top: number
) {
  const tiles = [
    {
      label: data.isThisYear ? "flowers this year" : `flowers in ${data.year}`,
      value: NUMBER.format(data.flowers),
    },
    { label: "words, every one mine", value: NUMBER.format(data.words) },
    {
      label: "my fullest month",
      value: data.fullestMonth
        ? MONTH_LONG.format(data.fullestMonth)
        : "Not yet",
    },
  ];
  const width = (INNER - 32) / 3;
  for (const [index, tile] of tiles.entries()) {
    const x = PAD + index * (width + 16);
    ctx.beginPath();
    ctx.roundRect(x, top, width, 125, 20);
    ctx.fillStyle = color["paper-tint"];
    ctx.fill();

    ctx.textBaseline = "top";
    ctx.fillStyle = color.ink;
    fitFont(
      ctx,
      tile.value,
      (size) => `${size}px ${font.display}`,
      56,
      width - 48
    );
    ctx.fillText(tile.value, x + 24, top + 22);
    ctx.font = `17px ${font.sans}`;
    ctx.fillStyle = color["ink-muted"];
    ctx.fillText(tile.label, x + 24, top + 84);
  }
}

function drawMeadow(
  ctx: CanvasRenderingContext2D,
  { color }: Theme,
  image: HTMLImageElement
) {
  const top = SIZE - MEADOW_HEIGHT;
  // Cover the band, showing the lower part of the picture where the lilies are
  const scale = Math.max(SIZE / image.width, MEADOW_HEIGHT / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, SIZE, MEADOW_HEIGHT);
  ctx.clip();
  ctx.drawImage(
    image,
    (SIZE - width) / 2,
    top - (height - MEADOW_HEIGHT) * 0.75,
    width,
    height
  );
  ctx.restore();

  const fade = ctx.createLinearGradient(0, top, 0, top + MEADOW_HEIGHT * 0.7);
  fade.addColorStop(0, color["paper-raised"]);
  fade.addColorStop(1, "transparent");
  ctx.fillStyle = fade;
  ctx.fillRect(0, top, SIZE, MEADOW_HEIGHT);
}

function drawFooter(ctx: CanvasRenderingContext2D, { color, font }: Theme) {
  const height = 58;
  const top = SIZE - PAD - height;
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(PAD, top, INNER, height, height / 2);
  ctx.fillStyle = color["paper-page"];
  ctx.fill();
  ctx.restore();

  drawFlower(ctx, PAD + 31, top + height / 2, 22, color.daylily);
  ctx.textBaseline = "middle";
  ctx.font = `30px ${font.display}`;
  ctx.fillStyle = color.ink;
  ctx.fillText("Daylily", PAD + 52, top + height / 2);
  ctx.font = `16px ${font.sans}`;
  ctx.fillStyle = color["ink-subtle"];
  ctx.textAlign = "right";
  ctx.fillText(
    "One page a day, grown into a garden.",
    PAD + INNER - 22,
    top + height / 2
  );
  ctx.textAlign = "left";
}

/**
 * Draws the garden's share card: the name, the year's flowers, three numbers and
 * the meadow, as a PNG. Drawn from the data rather than captured from the
 * screen, so it looks the same at any window size and theme.
 */
export async function renderShareCard(data: ShareCardData) {
  const theme = readTheme();
  await Promise.all([
    document.fonts.load(`96px ${theme.font.display}`),
    document.fonts.load(`600 20px ${theme.font.sans}`),
    document.fonts.load(`italic 26px ${theme.font.writing}`),
  ]);
  const image = await loadImage(meadow);

  const canvas = document.createElement("canvas");
  canvas.width = SIZE * SCALE;
  canvas.height = SIZE * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = theme.color["paper-raised"];
  ctx.fillRect(0, 0, SIZE, SIZE);

  drawMeadow(ctx, theme, image);
  const graphTop = drawHeader(ctx, theme, data);
  const statsTop = drawGraph(ctx, theme, data, graphTop);
  drawStats(ctx, theme, data, statsTop);
  drawFooter(ctx, theme);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) {
    throw new Error("The share card could not be encoded");
  }
  return new Uint8Array(await blob.arrayBuffer());
}

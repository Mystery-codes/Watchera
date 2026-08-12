import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#e50914"/>
  <polygon points="35,25 35,75 78,50" fill="white"/>
</svg>`;

async function makeIcon(size) {
  const svg = iconSvg.replace(/{SIZE}/g, String(size));
  const outPath = path.join(publicDir, `icon-${size}.png`);
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`Generated ${outPath}`);
}

(async () => {
  await makeIcon(192);
  await makeIcon(512);
  console.log("All icons generated");
})();

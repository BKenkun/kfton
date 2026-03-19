
import fs from 'fs/promises';
import path from 'path';
import HeroAdminContent from './hero-admin-content';
import type { HeroFormData } from './actions';

async function getHeroContent(): Promise<HeroFormData> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'hero-data.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading or parsing hero data:", error);
    return {
      text: "todo empieza con <span class='font-bold text-kfton-red'>kfton</span>",
      position: "center-center",
      textSize: 64,
      backgroundType: "youtube",
      backgroundUrl: "j7rUThNFB6A",
      button: {
        enabled: false,
        text: "Ver más",
        href: "#",
        padding: 32
      }
    };
  }
}

export default async function HeroAdminPage() {
    const heroContent = await getHeroContent();

    return <HeroAdminContent heroContent={heroContent} />;
}

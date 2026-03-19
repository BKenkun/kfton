import fs from 'fs/promises';
import path from 'path';
import MenuEditorForm from './menu-editor-form';
import type { MenuFormData } from './actions';

async function getMenuContent(): Promise<MenuFormData> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'menu-data.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    // Ensure dishesOfTheWeek is an array for backward compatibility
    if (data.dishOfTheWeek) {
        data.dishesOfTheWeek = [data.dishOfTheWeek];
        delete data.dishOfTheWeek;
    }
    if (!data.dishesOfTheWeek) {
        data.dishesOfTheWeek = [];
    }
    return data;
  } catch (error) {
    console.error("Error reading or parsing menu data:", error);
    // Devuelve un estado por defecto si el archivo no existe o está corrupto
    return {
      dishesOfTheWeek: [],
      categories: []
    };
  }
}

export default async function MenuAdminPage() {
  const menuContent = await getMenuContent();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Menú</h1>
      </div>
      <div className="flex-1">
         <MenuEditorForm menuContent={menuContent} />
      </div>
    </div>
  );
}

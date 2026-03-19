
import fs from 'fs/promises';
import path from 'path';
import ScheduleEditorForm from './schedule-editor-form';
import type { ScheduleFormData } from './actions';

async function getScheduleContent(): Promise<ScheduleFormData> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'schedule-data.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading or parsing schedule data:", error);
    return {
      schedule: [
        { day: "Lunes", hours: "" },
        { day: "Martes", hours: "" },
        { day: "Miércoles", hours: "" },
        { day: "Jueves", hours: "" },
        { day: "Viernes", hours: "" },
        { day: "Sábado", hours: "" },
        { day: "Domingo", hours: "" }
      ]
    };
  }
}

export default async function ScheduleAdminPage() {
  const scheduleContent = await getScheduleContent();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Horario</h1>
      </div>
      <div className="flex-1">
         <ScheduleEditorForm scheduleContent={scheduleContent} />
      </div>
    </div>
  );
}


import fs from 'fs/promises';
import path from 'path';
import ReviewsEditorForm from './reviews-editor-form';
import type { ReviewsFormData } from './actions';

async function getReviewsContent(): Promise<ReviewsFormData> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'reviews-data.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading or parsing reviews data:", error);
    return {
      reviews: []
    };
  }
}

export default async function ReviewsAdminPage() {
  const reviewsContent = await getReviewsContent();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Reseñas</h1>
      </div>
      <div className="flex-1">
         <ReviewsEditorForm reviewsContent={reviewsContent} />
      </div>
    </div>
  );
}

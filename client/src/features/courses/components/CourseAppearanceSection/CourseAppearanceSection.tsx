import React from 'react';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload.tsx';
import { ThemeColorPicker } from '@/components/courses/ThemeColorPicker/ThemeColorPicker.tsx';

export const CourseAppearanceSection = ({ values, handlers }: any) => {
  console.log('Колір, який прийшов з бекенду (values.themeColor):', `"${values.themeColor}"`);

  return (
    <>
      <FileUpload
        label="Фонове зображення"
        height="140px"
        maxFiles={1}
        values={values.backgroundFiles}
        onFilesChange={handlers.setBackgroundFiles}
        existingUrl={values.existingBackgroundUrl}
        onRemoveExisting={() => handlers.setExistingBackgroundUrl(null)}
      />

      <ThemeColorPicker selectedColor={values.themeColor} onChange={handlers.setThemeColor} />
    </>
  );
};

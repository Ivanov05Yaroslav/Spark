import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { materialsService } from '@/api/materials.service';
import { courseService } from '@/api/courses.service';
import { toast } from '@/libs/configs/Toast';

interface FormValues {
  title: string;
  module: string;
  isHidden: boolean;
  file: File | null;
}

export const useFileMaterialForm = () => {
  const navigate = useNavigate();
  const { id: courseId, materialId } = useParams<{ id: string; materialId?: string }>();

  const isEditMode = Boolean(materialId);

  const [values, setValues] = useState<FormValues>({
    title: '',
    module: '',
    isHidden: false,
    file: null,
  });

  const [courseInfo, setCourseInfo] = useState({ subjectName: '', className: '' });
  const [modulesOptions, setModulesOptions] = useState<{ value: string; label: string }[]>([]);

  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        const courseData = (await courseService.getCourseById(courseId)) as any;

        setCourseInfo({
          subjectName: courseData.subject?.name || 'Невідомий предмет',
          className: courseData.class?.name || 'Невідомий клас',
        });

        if (courseData.modules) {
          setModulesOptions(courseData.modules.map((m: any) => ({ value: m.id, label: m.title })));
        }

        if (isEditMode && materialId) {
          const allItems = courseData.modules?.flatMap((m: any) => m.items || []) || [];
          const currentMaterial = allItems.find((item: any) => item.id === materialId);

          if (currentMaterial) {
            setValues({
              title: currentMaterial.title || '',
              module: currentMaterial.courseModuleId || currentMaterial.moduleId || '',
              isHidden: currentMaterial.isHidden || false,
              file: null,
            });
            setExistingFileUrl(currentMaterial.fileUrl || null);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження даних:', error);
        toast.error('Не вдалося завантажити дані курсу');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [courseId, isEditMode, materialId]);

  const handleChange = (field: keyof Omit<FormValues, 'file'>, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilesChange = (files: File[]) => {
    setValues((prev) => ({ ...prev, file: files[0] || null }));
  };

  const handleRemoveExisting = () => {
    setExistingFileUrl(null);
  };

  const isFormValid = Boolean(
    values.title.trim() &&
    values.module.trim() &&
    (values.file !== null || (isEditMode && existingFileUrl !== null)),
  );

  const handleSubmit = async () => {
    if (!courseId) return;
    setIsSubmitting(true);

    const isExistingModule = modulesOptions.some((m) => m.value === values.module);

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('isHidden', String(values.isHidden));

    if (isExistingModule) {
      formData.append('courseModuleId', values.module);
    } else {
      formData.append('newModuleTitle', values.module);
    }

    if (!isEditMode) {
      formData.append('courseId', courseId);
    }

    if (values.file) {
      formData.append('file', values.file);
    }

    try {
      if (isEditMode && materialId) {
        await materialsService.updateMaterial(materialId, formData);
        toast.success('Матеріал успішно оновлено!');
      } else {
        await materialsService.createFile(formData);
        toast.success('Матеріал успішно створено!');
      }
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Сталася помилка при збереженні');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    handlers: { handleChange, handleFilesChange, handleRemoveExisting, handleSubmit },
    data: { modulesOptions, courseInfo, existingFileUrl },
    isLoading,
    isSubmitting,
    isFormValid,
    isEditMode,
  };
};

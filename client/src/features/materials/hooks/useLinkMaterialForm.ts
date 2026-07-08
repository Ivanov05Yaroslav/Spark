import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { materialsService } from '@/api/materials.service';
import { courseService } from '@/api/courses.service';
import { toast } from '@/libs/configs/Toast';

export const useLinkMaterialForm = () => {
  const navigate = useNavigate();
  const { id: courseId, materialId } = useParams<{ id: string; materialId?: string }>();

  const isEditMode = Boolean(materialId);

  const [values, setValues] = useState({
    title: '',
    module: '',
    linkUrl: '',
    isHidden: false,
  });

  const [courseInfo, setCourseInfo] = useState({ subjectName: '', className: '' });
  const [modulesOptions, setModulesOptions] = useState<{ value: string; label: string }[]>([]);

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
          const materialData = await materialsService.getMaterialById(materialId);
          setValues({
            title: materialData.title || '',
            module: materialData.courseModuleId || '',
            linkUrl: materialData.linkUrl || '',
            isHidden: materialData.isHidden || false,
          });
        }
      } catch (err) {
        console.error('Помилка при завантаженні початкових даних:', err);
        toast.error('Не вдалося завантажити дані для форми');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [courseId, isEditMode, materialId]);

  const handleChange = (field: keyof typeof values, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = Boolean(values.title.trim() && values.module.trim() && values.linkUrl.trim());

  const handleSubmit = async () => {
    if (!courseId) return;
    setIsSubmitting(true);

    const isExistingModule = modulesOptions.some((m) => m.value === values.module);
    const courseModuleId = isExistingModule ? values.module : undefined;
    const newModuleTitle = !isExistingModule ? values.module : undefined;

    try {
      if (isEditMode && materialId) {
        await materialsService.updateLink(materialId, {
          title: values.title,
          linkUrl: values.linkUrl,
          courseModuleId,
          newModuleTitle,
          isHidden: values.isHidden,
        });
        toast.success('Посилання успішно оновлено!');
      } else {
        await materialsService.createLink({
          courseId,
          title: values.title,
          linkUrl: values.linkUrl,
          courseModuleId,
          newModuleTitle,
          isHidden: values.isHidden,
        });
        toast.success('Посилання успішно створено!');
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
    handlers: { handleChange, handleSubmit },
    data: { modulesOptions, courseInfo },
    isLoading,
    isSubmitting,
    isFormValid,
    isEditMode,
  };
};

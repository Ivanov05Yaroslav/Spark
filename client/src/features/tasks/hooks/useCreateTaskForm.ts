import { useState } from 'react';
import { UploadedLink } from '@/types/tasks.types';


export const useCreateTaskForm = () => {
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [classes, setClasses] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState('');
    const [module, setModule] = useState('');
    const [gradingGroup, setGradingGroup] = useState('');
    const [hideTask, setHideTask] = useState(false);

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const [uploadedLinks, setUploadedLinks] = useState<UploadedLink[]>([]);
    const [isUploadLinkModalOpen, setIsUploadLinkModalOpen] = useState(false);
    const [linkInput, setLinkInput] = useState('');
    const [linkNameInput, setLinkNameInput] = useState('');

    const isFormValid = !!(title && classes.length > 0 && dueDate && module && gradingGroup);

    const handleSubmit = () => {
        console.log('Отправка данных на сервер:', {
            title,
            instructions,
            classes,
            dueDate,
            module,
            gradingGroup,
            hideTask,
            files: uploadedFiles,
            links: uploadedLinks
        });
    };

    const handleFilesSelectFromModal = (newFiles: File[]) => {
        setUploadedFiles(newFiles);
        setIsUploadModalOpen(false);
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleAddLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (linkInput.trim()) {
            setUploadedLinks(prev => [
                ...prev,
                { url: linkInput.trim(), name: linkNameInput.trim() }
            ]);
            setLinkInput('');
            setLinkNameInput('');
            setIsUploadLinkModalOpen(false);
        }
    };

    const handleRemoveLink = (indexToRemove: number) => {
        setUploadedLinks(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return {
        formState: {
            title, setTitle,
            instructions, setInstructions,
            classes, setClasses,
            dueDate, setDueDate,
            module, setModule,
            gradingGroup, setGradingGroup,
            hideTask, setHideTask
        },
        filesState: {
            uploadedFiles,
            setUploadedFiles,
            isUploadModalOpen,
            setIsUploadModalOpen,
            handleFilesSelectFromModal,
            handleRemoveFile
        },
        linksState: {
            uploadedLinks,
            setUploadedLinks,
            isUploadLinkModalOpen,
            setIsUploadLinkModalOpen,
            linkInput,
            setLinkInput,
            linkNameInput,
            setLinkNameInput,
            handleAddLink,
            handleRemoveLink
        },
        isFormValid,
        handleSubmit
    };
};
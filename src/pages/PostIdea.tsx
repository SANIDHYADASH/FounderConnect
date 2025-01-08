import React from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import type { StartupIdea } from '../types';

interface IdeaFormData {
  title: string;
  description: string;
  equityRange: string;
  salaryRange: string;
  skills: string;
}

const PostIdea = () => {
  const { userProfile } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<IdeaFormData>();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = React.useState('');
  const editingIdea = location.state?.idea as StartupIdea | undefined;

  React.useEffect(() => {
    if (editingIdea) {
      // Pre-fill form with existing idea data
      const defaultValues = {
        title: editingIdea.title,
        description: editingIdea.description,
        equityRange: editingIdea.equityRange,
        salaryRange: editingIdea.salaryRange,
        skills: editingIdea.skills.join(', ')
      };
      Object.keys(defaultValues).forEach(key => {
        const input = document.querySelector(`[name="${key}"]`) as HTMLInputElement;
        if (input) {
          input.value = defaultValues[key as keyof typeof defaultValues];
        }
      });
    }
  }, [editingIdea]);

  const onSubmit = async (data: IdeaFormData) => {
    try {
      if (!userProfile) return;

      const ideaData = {
        founderId: userProfile.uid,
        title: data.title,
        description: data.description,
        equityRange: data.equityRange,
        salaryRange: data.salaryRange,
        skills: data.skills.split(',').map(skill => skill.trim()),
        createdAt: editingIdea ? editingIdea.createdAt : new Date(),
      };

      if (editingIdea) {
        await updateDoc(doc(db, 'ideas', editingIdea.id), ideaData);
      } else {
        await addDoc(collection(db, 'ideas'), ideaData);
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(editingIdea ? 'Failed to update idea' : 'Failed to post idea');
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {editingIdea ? 'Edit Startup Idea' : 'Post Your Startup Idea'}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="A brief, catchy title for your idea"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Describe your idea, target market, and current progress"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Equity Range</label>
            <input
              {...register('equityRange', { required: 'Equity range is required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., 5-10%"
            />
            {errors.equityRange && (
              <p className="mt-1 text-sm text-red-600">{errors.equityRange.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Salary Range</label>
            <input
              {...register('salaryRange', { required: 'Salary range is required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., $80k-100k/year"
            />
            {errors.salaryRange && (
              <p className="mt-1 text-sm text-red-600">{errors.salaryRange.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Required Skills</label>
            <input
              {...register('skills', { required: 'Skills are required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., React, Node.js, AWS (comma-separated)"
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {editingIdea ? 'Update Idea' : 'Post Idea'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostIdea;
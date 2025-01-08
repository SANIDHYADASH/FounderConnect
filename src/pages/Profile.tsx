import React from 'react';
import { useForm } from 'react-hook-form';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

const Profile = () => {
  const { userProfile } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<User>>({
    defaultValues: userProfile || {}
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const onSubmit = async (data: Partial<User>) => {
    try {
      if (!userProfile?.uid) return;

      // Create an update object only with defined values
      const updateData: Partial<User> = {};
      
      if (data.name) updateData.name = data.name;
      if (data.githubProfile !== undefined) updateData.githubProfile = data.githubProfile;
      if (data.linkedinProfile !== undefined) updateData.linkedinProfile = data.linkedinProfile;
      if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber;
      
      await updateDoc(doc(db, 'users', userProfile.uid), updateData);
      
      setSuccess('Profile updated successfully!');
      setError('');
    } catch (err) {
      setError('Failed to update profile');
      setSuccess('');
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {userProfile?.role === 'developer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GitHub Profile URL
                </label>
                <input
                  {...register('githubProfile')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  LinkedIn Profile URL
                </label>
                <input
                  {...register('linkedinProfile')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              WhatsApp Number
            </label>
            <input
              {...register('whatsappNumber')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="+1234567890"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
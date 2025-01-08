import React from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import type { User, UserRole } from '../types';

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  githubProfile?: string;
}

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const role = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user: User = {
        uid: userCredential.user.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        ...(data.githubProfile && { githubProfile: data.githubProfile }),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), user);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: 6 })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select a role</option>
                <option value="founder">Founder</option>
                <option value="developer">Developer</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {role === 'developer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GitHub Profile URL
                </label>
                <input
                  {...register('githubProfile')}
                  placeholder="https://github.com/username"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
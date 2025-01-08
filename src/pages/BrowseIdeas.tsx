import React from 'react';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { StartupIdea } from '../types';

const BrowseIdeas = () => {
  const { userProfile } = useAuth();
  const [ideas, setIdeas] = React.useState<StartupIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = React.useState<StartupIdea | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasQuery = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(ideasQuery);
        setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupIdea)));
      } catch (err) {
        console.error(err);
        setError('Failed to load ideas');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  const handleApply = async (idea: StartupIdea) => {
    setSelectedIdea(idea);
  };

  const submitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedIdea || !userProfile) return;

    const form = e.target as HTMLFormElement;
    const proposal = (form.elements.namedItem('proposal') as HTMLTextAreaElement).value;
    const equityRequest = (form.elements.namedItem('equityRequest') as HTMLInputElement).value;
    const salaryRequest = (form.elements.namedItem('salaryRequest') as HTMLInputElement).value;

    try {
      await addDoc(collection(db, 'applications'), {
        ideaId: selectedIdea.id,
        developerId: userProfile.uid,
        proposal,
        equityRequest,
        salaryRequest,
        status: 'pending',
        createdAt: new Date(),
      });

      setSelectedIdea(null);
      // Show success message or redirect
    } catch (err) {
      console.error(err);
      setError('Failed to submit application');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Browse Startup Ideas</h1>

      <div className="grid gap-6">
        {ideas.map(idea => (
          <div key={idea.id} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{idea.title}</h2>
            <p className="text-gray-600 mb-4">{idea.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Equity: {idea.equityRange}</span>
                <span className="text-sm text-gray-500 ml-4">Salary: {idea.salaryRange}</span>
              </div>
              <button
                onClick={() => handleApply(idea)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedIdea && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Apply to: {selectedIdea.title}</h3>
            
            <form onSubmit={submitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Proposal</label>
                <textarea
                  name="proposal"
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Describe why you're a good fit and your relevant experience"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Equity Request</label>
                <input
                  type="text"
                  name="equityRequest"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="e.g., 7%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Salary Request</label>
                <input
                  type="text"
                  name="salaryRequest"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="e.g., $90k/year"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedIdea(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseIdeas;
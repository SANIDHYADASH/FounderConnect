import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { StartupIdea, Application } from '../types';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [ideas, setIdeas] = React.useState<StartupIdea[]>([]);
  const [applications, setApplications] = React.useState<Application[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;

      if (userProfile.role === 'founder') {
        const ideasQuery = query(
          collection(db, 'ideas'),
          where('founderId', '==', userProfile.uid)
        );
        const ideasSnapshot = await getDocs(ideasQuery);
        setIdeas(ideasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupIdea)));
      } else {
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('developerId', '==', userProfile.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        setApplications(applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
      }
    };

    fetchData();
  }, [userProfile]);

  if (!userProfile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Welcome, {userProfile.name}!
      </h1>

      {userProfile.role === 'founder' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Posted Ideas</h2>
          {ideas.length === 0 ? (
            <p className="text-gray-600">You haven't posted any ideas yet.</p>
          ) : (
            <div className="grid gap-6">
              {ideas.map(idea => (
                <div key={idea.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium">{idea.title}</h3>
                  <p className="text-gray-600 mt-2">{idea.description}</p>
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Equity: {idea.equityRange}</span>
                    <span className="text-sm text-gray-500 ml-4">Salary: {idea.salaryRange}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
          {applications.length === 0 ? (
            <p className="text-gray-600">You haven't applied to any ideas yet.</p>
          ) : (
            <div className="grid gap-6">
              {applications.map(application => (
                <div key={application.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">Application for Idea #{application.ideaId}</h3>
                      <p className="text-gray-600 mt-2">{application.proposal}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Equity Request: {application.equityRequest}</span>
                    <span className="text-sm text-gray-500 ml-4">Salary Request: {application.salaryRequest}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
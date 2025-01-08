import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Github, Linkedin, Mail, Phone } from 'lucide-react';
import type { StartupIdea, Application, User } from '../types';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = React.useState<StartupIdea[]>([]);
  const [applications, setApplications] = React.useState<(Application & { 
    idea?: StartupIdea;
    developer?: User;
    founder?: User;
  })[]>([]);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ type: 'idea' | 'application', id: string } | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;

      if (userProfile.role === 'founder') {
        // Fetch founder's ideas
        const ideasQuery = query(
          collection(db, 'ideas'),
          where('founderId', '==', userProfile.uid)
        );
        const ideasSnapshot = await getDocs(ideasQuery);
        const ideasData = ideasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupIdea));
        setIdeas(ideasData);

        // Fetch applications for founder's ideas
        const applications: (Application & { 
          developer?: User;
          idea?: StartupIdea;
        })[] = [];
        
        for (const idea of ideasData) {
          const applicationsQuery = query(
            collection(db, 'applications'),
            where('ideaId', '==', idea.id)
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          
          for (const appDoc of applicationsSnapshot.docs) {
            const appData = { id: appDoc.id, ...appDoc.data() } as Application;
            // Fetch developer details
            const developerDoc = await getDoc(doc(db, 'users', appData.developerId));
            const developerData = developerDoc.data() as User;
            
            applications.push({
              ...appData,
              developer: developerData,
              idea
            });
          }
        }
        
        setApplications(applications);
      } else {
        // Fetch developer's applications
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('developerId', '==', userProfile.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = await Promise.all(
          applicationsSnapshot.docs.map(async (appDoc) => {
            const appData = { id: appDoc.id, ...appDoc.data() } as Application;
            // Fetch idea details
            const ideaDoc = await getDoc(doc(db, 'ideas', appData.ideaId));
            const ideaData = { id: ideaDoc.id, ...ideaDoc.data() } as StartupIdea;
            // Fetch founder details
            const founderDoc = await getDoc(doc(db, 'users', ideaData.founderId));
            const founderData = founderDoc.data() as User;
            
            return {
              ...appData,
              idea: ideaData,
              founder: founderData
            };
          })
        );
        setApplications(applicationsData);
      }
    };

    fetchData();
  }, [userProfile]);

  const handleApplicationAction = async (application: Application, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'applications', application.id), {
        status,
        ...(status === 'rejected' && { rejectionReason })
      });

      // Refresh applications
      const updatedApplications = applications.map(app =>
        app.id === application.id ? { ...app, status, rejectionReason } : app
      );
      setApplications(updatedApplications);
      setSelectedApplication(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleEditIdea = (idea: StartupIdea) => {
    navigate('/post-idea', { state: { idea } });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await deleteDoc(doc(db, 'ideas', ideaId));
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      await deleteDoc(doc(db, 'applications', applicationId));
      setApplications(applications.filter(app => app.id !== applicationId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Welcome, {userProfile.name}!
      </h1>

      {userProfile.role === 'founder' ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Posted Ideas</h2>
            {ideas.length === 0 ? (
              <p className="text-gray-600">You haven't posted any ideas yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ideas.map(idea => (
                  <div key={idea.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{idea.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditIdea(idea)}
                            className="text-gray-400 hover:text-indigo-600"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'idea', id: idea.id })}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
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
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Equity: {idea.equityRange}</span>
                        <span>Salary: {idea.salaryRange}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Applications Received</h2>
            {applications.length === 0 ? (
              <p className="text-gray-600">No applications received yet.</p>
            ) : (
              <div className="grid gap-6">
                {applications.map(application => (
                  <div key={application.id} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">
                          Application for {application.idea?.title}
                        </h3>
                        <p className="text-gray-600 mt-2">{application.proposal}</p>
                        
                        {application.developer && (
                          <div className="mt-4 space-y-2">
                            <h4 className="font-medium">Developer Profile:</h4>
                            <p className="text-gray-700">Name: {application.developer.name}</p>
                            
                            <div className="flex items-center space-x-2">
                              <Github className="h-4 w-4 text-gray-500" />
                              <a 
                                href={application.developer.githubProfile} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                GitHub Profile
                              </a>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Linkedin className="h-4 w-4 text-gray-500" />
                              <a 
                                href={application.developer.linkedinProfile} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                LinkedIn Profile
                              </a>
                            </div>

                            {application.status === 'accepted' && (
                              <>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span>{application.developer.email}</span>
                                </div>
                                {application.developer.whatsappNumber && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>WhatsApp: {application.developer.whatsappNumber}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    {application.status === 'pending' && (
                      <div className="mt-4 flex gap-4">
                        <button
                          onClick={() => handleApplicationAction(application, 'accepted')}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {application.status === 'rejected' && application.rejectionReason && (
                      <div className="mt-4">
                        <p className="text-red-600">Rejection reason: {application.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium">
                          Application for {application.idea?.title}
                        </h3>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'application', id: application.id })}
                          className="text-gray-400 hover:text-red-600 ml-4"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-gray-600 mt-2">{application.proposal}</p>
                      
                      {application.status === 'accepted' && application.founder && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium">Founder Contact Details:</h4>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{application.founder.email}</span>
                          </div>
                          {application.founder.whatsappNumber && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>WhatsApp: {application.founder.whatsappNumber}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>

                  {application.status === 'rejected' && application.rejectionReason && (
                    <div className="mt-4">
                      <p className="text-red-600">Rejection reason: {application.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Please provide a reason for rejection"
              />
            </div>

            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplicationAction(selectedApplication, 'rejected')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'idea') {
                    handleDeleteIdea(deleteConfirm.id);
                  } else {
                    handleDeleteApplication(deleteConfirm.id);
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
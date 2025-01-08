import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Lightbulb, HandshakeIcon } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Connect with Your Perfect Technical Co-Founder
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Turn your startup idea into reality by finding the right technical partner. 
            Join FounderConnect to collaborate with talented developers.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/browse-ideas"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Browse Ideas
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Users className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Find Co-Founders</h3>
            <p className="text-gray-600">
              Connect with skilled developers who share your vision and are ready to join your startup journey.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Lightbulb className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Share Your Ideas</h3>
            <p className="text-gray-600">
              Present your startup ideas to a community of technical professionals looking for exciting projects.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <HandshakeIcon className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Partnerships</h3>
            <p className="text-gray-600">
              Establish clear terms for equity and compensation to build lasting and successful partnerships.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-xl mb-8">Join our community of founders and developers today.</p>
          <Link
            to="/register"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
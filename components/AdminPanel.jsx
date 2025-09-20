import React, { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useContracts } from '../hooks/useContracts';
import { isAdmin } from '../utils/helpers';

const AdminPanel = () => {
  const { account } = useBlockchain();
  const { contract } = useContracts();
  const [showForm, setShowForm] = useState(false);
  const [resolvingMarket, setResolvingMarket] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    outcomes: ['', ''],
    endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [oracleAddress, setOracleAddress] = useState('');

  if (!account || !isAdmin(account)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
        <p className="text-gray-600">Access restricted to admin only.</p>
      </div>
    );
  }

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setLoading(true);
      // Convert end time to Unix timestamp
      const endTime = Math.floor(new Date(formData.endTime).getTime() / 1000);
      
      // Filter out empty outcomes
      const validOutcomes = formData.outcomes.filter(outcome => outcome.trim() !== '');
      
      const tx = await contract.createMarket(
        formData.category,
        formData.description,
        validOutcomes,
        endTime
      );
      
      await tx.wait();
      alert('Market created successfully!');
      setFormData({
        category: '',
        description: '',
        outcomes: ['', ''],
        endTime: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating market:', error);
      alert('Failed to create market: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMarket = async (marketId, winningOutcome) => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.resolveMarket(marketId, winningOutcome);
      await tx.wait();
      alert('Market resolved successfully!');
      setResolvingMarket(null);
    } catch (error) {
      console.error('Error resolving market:', error);
      alert('Failed to resolve market: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetOracle = async () => {
    if (!contract || !oracleAddress) return;

    try {
      setLoading(true);
      const tx = await contract.setOracle(oracleAddress);
      await tx.wait();
      alert('Oracle address set successfully!');
      setOracleAddress('');
    } catch (error) {
      console.error('Error setting oracle:', error);
      alert('Failed to set oracle: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addOutcomeField = () => {
    setFormData({
      ...formData,
      outcomes: [...formData.outcomes, '']
    });
  };

  const removeOutcomeField = (index) => {
    if (formData.outcomes.length <= 2) return;
    const newOutcomes = formData.outcomes.filter((_, i) => i !== index);
    setFormData({ ...formData, outcomes: newOutcomes });
  };

  const updateOutcome = (index, value) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes[index] = value;
    setFormData({ ...formData, outcomes: newOutcomes });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Oracle Management</h3>
          <div className="flex">
            <input
              type="text"
              value={oracleAddress}
              onChange={(e) => setOracleAddress(e.target.value)}
              placeholder="Enter oracle address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSetOracle}
              disabled={loading || !oracleAddress}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set Oracle
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-700">Market Management</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              {showForm ? 'Cancel' : 'Create New Market'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateMarket} className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Outcomes (at least 2 required)
                  </label>
                  <button
                    type="button"
                    onClick={addOutcomeField}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Outcome
                  </button>
                </div>
                
                {formData.outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => updateOutcome(index, e.target.value)}
                      placeholder={`Outcome ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.outcomes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOutcomeField(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || formData.outcomes.filter(o => o.trim()).length < 2}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Market'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
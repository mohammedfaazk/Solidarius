import React, { useState } from 'react';
import { useConsent } from '../hooks/useConsent';

interface TrustCenterProps {
  userId: string;
}

export const TrustCenter: React.FC<TrustCenterProps> = ({ userId }) => {
  const { consents, user, loading, updateConsent, deleteAllData, exportData } = useConsent(userId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deletionReceipt, setDeletionReceipt] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleConsent = async (key: keyof typeof consents) => {
    await updateConsent(key, !consents[key]);
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mannmitra-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    try {
      setIsDeleting(true);
      const receiptId = await deleteAllData();
      setDeletionReceipt(receiptId);
      setDeleteStep(3);
    } catch (error) {
      console.error('Deletion failed:', error);
      alert('Failed to delete data. Please try again.');
      setShowDeleteConfirm(false);
      setDeleteStep(0);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Trust Center</h1>
        <p className="text-gray-600">
          Your privacy and data control are our top priorities. Manage your data and privacy settings here.
        </p>
      </div>

      {/* Privacy Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-start gap-3">
          <div className="text-green-600 text-2xl">🔒</div>
          <div>
            <h3 className="text-green-800 font-semibold mb-2">Privacy-First Design</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Anonymous by default - no email or phone required</li>
              <li>• All personal information is redacted before storage</li>
              <li>• You control what data is stored and where</li>
              <li>• Local-first - most data stays on your device</li>
              <li>• Full data export and deletion available anytime</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Consent Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data & Privacy Controls</h3>
        
        <div className="space-y-6">
          {/* Analytics */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">Anonymous Analytics</h4>
              <p className="text-gray-600 text-sm mt-1">
                Help improve MannMitra by sharing anonymized usage patterns. No personal information is included.
              </p>
            </div>
            <label className="flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={consents.analytics}
                onChange={() => handleToggleConsent('analytics')}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                consents.analytics ? 'bg-primary-500' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  consents.analytics ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>

          {/* Journal Storage */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">Cloud Journal Backup</h4>
              <p className="text-gray-600 text-sm mt-1">
                Store your journal entries in the cloud for backup and sync across devices. All entries are encrypted and redacted.
              </p>
            </div>
            <label className="flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={consents.storeJournal}
                onChange={() => handleToggleConsent('storeJournal')}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                consents.storeJournal ? 'bg-primary-500' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  consents.storeJournal ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>

          {/* Community Participation */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">Community Participation</h4>
              <p className="text-gray-600 text-sm mt-1">
                Participate in community discussions and peer support. All posts are anonymous and moderated.
              </p>
            </div>
            <label className="flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={consents.community}
                onChange={() => handleToggleConsent('community')}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                consents.community ? 'bg-primary-500' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  consents.community ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>

          {/* Crisis Support Sharing */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">Crisis Support Sharing</h4>
              <p className="text-gray-600 text-sm mt-1">
                Allow sharing of redacted crisis context with counselors if you request human support during a crisis.
              </p>
            </div>
            <label className="flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={consents.shareCounselor}
                onChange={() => handleToggleConsent('shareCounselor')}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                consents.shareCounselor ? 'bg-primary-500' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  consents.shareCounselor ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Data */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Export Your Data</h4>
            <p className="text-gray-600 text-sm mb-4">
              Download all your data in JSON format. Includes journal entries, mood logs, and settings.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <span>📦</span>
                  Export Data
                </>
              )}
            </button>
          </div>

          {/* Delete Data */}
          <div className="border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Delete All Data</h4>
            <p className="text-gray-600 text-sm mb-4">
              Permanently delete all your data from our systems. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
              Delete My Data
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      {user && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">User ID:</span>
              <span className="text-gray-600 ml-2 font-mono">{user.uid}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="text-gray-600 ml-2">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Locale:</span>
              <span className="text-gray-600 ml-2">{user.locale}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Device Support:</span>
              <div className="ml-2 space-x-2">
                {user.deviceCaps.stt && <span className="text-green-600">🎤 STT</span>}
                {user.deviceCaps.tts && <span className="text-green-600">🔊 TTS</span>}
                {user.deviceCaps.webgpu && <span className="text-green-600">⚡ WebGPU</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {deleteStep === 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete All Data?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This will permanently delete all your data including:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 mb-6">
                  <li>• All journal entries and mood logs</li>
                  <li>• Thought records and CBT progress</li>
                  <li>• Community posts and interactions</li>
                  <li>• All settings and preferences</li>
                </ul>
                <p className="text-red-600 text-sm font-medium mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteStep(1)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {deleteStep === 1 && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Final Confirmation</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Type "DELETE" to confirm you want to permanently delete all your data.
                </p>
                <input
                  type="text"
                  placeholder="Type DELETE here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
                  onChange={(e) => {
                    if (e.target.value === 'DELETE') {
                      setDeleteStep(2);
                    }
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteStep(0)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ready to Delete</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Click the button below to permanently delete all your data from MannMitra.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteStep(1)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeleteData}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete All Data'
                    )}
                  </button>
                </div>
              </>
            )}

            {deleteStep === 3 && deletionReceipt && (
              <>
                <h3 className="text-lg font-semibold text-green-600 mb-4">Data Deleted Successfully</h3>
                <p className="text-gray-600 text-sm mb-4">
                  All your data has been permanently deleted from our systems.
                </p>
                <div className="bg-gray-50 rounded p-3 mb-6">
                  <p className="text-xs text-gray-600 mb-1">Deletion Receipt:</p>
                  <p className="text-sm font-mono text-gray-800">{deletionReceipt}</p>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Save this receipt for your records. You can now close this window.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteStep(0);
                    setDeletionReceipt(null);
                  }}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
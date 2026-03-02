import React, { useState } from 'react';
import { DEV_ROOM_PASSWORD } from './logic/dungeonTypes';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const DevRoomPasswordModal: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEV_ROOM_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-2xl border-2 border-gray-600 bg-gradient-to-b from-gray-900 to-gray-950 p-6 shadow-2xl"
      >
        <h2 className="text-center text-lg font-bold text-gray-200 mb-4">Dev Room Access</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          placeholder="Enter password"
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none mb-3"
        />
        {error && (
          <p className="text-red-400 text-xs text-center mb-3">Incorrect password</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm font-bold transition-colors"
          >
            Enter
          </button>
        </div>
      </form>
    </div>
  );
};

export default DevRoomPasswordModal;

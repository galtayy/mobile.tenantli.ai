import { useState } from 'react';
import TermlyModal from '../components/TermlyModal';

export default function TestModal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBF5DA] p-4">
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Termly Modal
      </button>

      <TermlyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Test Policy"
        policyUUID="5a062fb9-9dc3-4411-91d9-ca741286d1de"
      />
    </div>
  );
}
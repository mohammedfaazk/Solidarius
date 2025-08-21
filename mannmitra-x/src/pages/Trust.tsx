import React from 'react';
import { TrustCenter } from '../components/TrustCenter';

// For demo, using a static user ID
const DEMO_USER_ID = 'anon_demo_user';

export const Trust: React.FC = () => {
  return <TrustCenter userId={DEMO_USER_ID} />;
};
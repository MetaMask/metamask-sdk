import React from 'react';
import { Link } from 'react-router-dom';

import './App.css';

interface DemoLinkProps {
  title: string;
  description?: string;
  link: string;
}

const DemoLink = ({ title, link }: DemoLinkProps) => {
  return (
    <div style={{ padding: 20, border: '1px solid' }}>
      <Link to={link}>{title}</Link>
    </div>
  );
};
export const App = () => {
  return (
    <div>
      <h1>SDK Demo Playground</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <DemoLink title={'Demo Provider'} link={'demo'} />
        <DemoLink title={'Web3 Onboard'} link={'onboard'} />
      </div>
    </div>
  );
};

export default App;

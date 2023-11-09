import React from 'react';
import packageJson from '../../package.json';

export default function PackageVersion() {
  return <div>PackageVersion: {packageJson.version}</div>;
}

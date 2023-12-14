import React from 'react'

export default function SDKVersion({version}: {version?: string}) {
  return (
    <div style={{textAlign: 'center', color: '#BBC0C5', fontSize: 12}}>SDK Version {version ? `v${version}`:`unknown`}</div>
  )
}

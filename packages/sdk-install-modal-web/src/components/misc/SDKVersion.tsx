import { h } from "@stencil/core";

export default function SDKVersion({version}: {version?: string}) {
  return (
    <div style={{textAlign: 'center', color: '#BBC0C5', fontSize: '12px'}}>SDK Version {version ? `v${version}`:`unknown`}</div>
  )
}

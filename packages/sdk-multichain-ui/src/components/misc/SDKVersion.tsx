import { h } from "@stencil/core";

export default function SDKVersion({version}: {version?: string}) {
  return (
    <div class="version-title">SDK Version {version ? `v${version}`:`unknown`}</div>
  )
}

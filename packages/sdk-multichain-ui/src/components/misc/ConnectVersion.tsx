import { h } from "@stencil/core";

export default function ConnectVersion({version}: {version?: string}) {
  return (
    <div class="version-title">Connect Version {version ? `v${version}`:`unknown`}</div>
  )
}

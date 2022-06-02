console.log("helloworld from content script MetaMaskSDK");

/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
//@ts-ignore
function injectScript(file_path, tag) {
  console.log(file_path);

  const container = document.head || document.documentElement;
  const scriptTag = document.createElement("script");
  scriptTag.setAttribute("async", "false");
  scriptTag.setAttribute("type", "text/javascript");
  scriptTag.setAttribute("src", file_path);
  container.insertBefore(scriptTag, container.children[0]);
}
//@ts-ignore
injectScript(chrome.extension.getURL("assets/sdk.js"), "body");

export {};

"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkO5ECOCX2js = require('./chunk-O5ECOCX2.js');


var _chunk4EQNSGSRjs = require('./chunk-4EQNSGSR.js');

// src/siteMetadata.ts
async function sendSiteMetadata(engine, log) {
  try {
    const domainMetadata = await getSiteMetadata();
    engine.handle(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "metamask_sendDomainMetadata",
        params: domainMetadata
      },
      _chunkO5ECOCX2js.NOOP
    );
  } catch (error) {
    log.error({
      message: _chunk4EQNSGSRjs.messages_default.errors.sendSiteMetadata(),
      originalError: error
    });
  }
}
async function getSiteMetadata() {
  return {
    name: getSiteName(window),
    icon: await getSiteIcon(window)
  };
}
function getSiteName(windowObject) {
  const { document: document2 } = windowObject;
  const siteName = document2.querySelector(
    'head > meta[property="og:site_name"]'
  );
  if (siteName) {
    return siteName.content;
  }
  const metaTitle = document2.querySelector(
    'head > meta[name="title"]'
  );
  if (metaTitle) {
    return metaTitle.content;
  }
  if (document2.title && document2.title.length > 0) {
    return document2.title;
  }
  return window.location.hostname;
}
async function getSiteIcon(windowObject) {
  const { document: document2 } = windowObject;
  const icons = document2.querySelectorAll(
    'head > link[rel~="icon"]'
  );
  for (const icon of Array.from(icons)) {
    if (icon && await imgExists(icon.href)) {
      return icon.href;
    }
  }
  return null;
}
async function imgExists(url) {
  return new Promise((resolve, reject) => {
    try {
      const img = document.createElement("img");
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}



exports.sendSiteMetadata = sendSiteMetadata;
//# sourceMappingURL=chunk-Q4DN6VYN.js.map
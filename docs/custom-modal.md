# Creating Custom MetaMask Modals for Web Applications

When integrating MetaMask into web applications, providing a tailored user interface for interactions such as prompting the installation of MetaMask can significantly enhance user experience. This guide will walk you through the process of creating custom modals for MetaMask within various web frameworks, focusing on a React implementation with insights on adapting the concept for other frameworks like Vue.js or plain HTML/JavaScript.

## Step-by-Step Guide for React

### 1. Create a Custom Modal Component

Begin by crafting a custom modal component that aligns with your application's design and functionality requirements.

```javascript
import React from 'react';

const CustomModal = ({ onClose }) => (
  <div className="modal">
    <button onClick={onClose}>Close</button>
  </div>
);

export default CustomModal;
```

### 2. Implement Custom Modal Logic with MetaMaskProvider

Within `MetaMaskProvider`, use the `modals` prop to set up custom behavior for scenarios like MetaMask not being installed.

```javascript
import { MetaMaskProvider } from '@metamask/sdk-react';
import CustomModal from './CustomModal';
import ReactDOM from 'react-dom';

const App = () => (
  <MetaMaskProvider
    sdkOptions={{
      modals: {
        install: ({ link }) => {
          let modalContainer = null;

          return {
            mount: () => {
              modalContainer = document.createElement('div');
              document.body.appendChild(modalContainer);

              ReactDOM.render(
                <CustomModal
                  onClose={() => {
                    ReactDOM.unmountComponentAtNode(modalContainer);
                    modalContainer.remove();
                  }}
                />,
                modalContainer,
              );
            },
            unmount: () => {
              if (modalContainer) {
                ReactDOM.unmountComponentAtNode(modalContainer);
                modalContainer.remove();
              }
            },
          };
        },
      },
    }}
  >
    {/* Other components */}
  </MetaMaskProvider>
);

export default App;
```

### 3. Test Your Application

Ensure the custom modal operates as intended, especially in scenarios like when MetaMask isn't installed.

## Conclusion

Creating custom MetaMask modals provides a uniform and engaging user experience across different web frameworks. The principles detailed here for React are adaptable to frameworks like Vue.js or even vanilla HTML/JavaScript, ensuring flexibility and consistency in handling MetaMask interactions across diverse web applications.

For a React-specific implementation example, check out the `react-with-custom-modal` in our repo. This example can serve as a starting point for understanding the approach, which you can then adapt to other frameworks as needed.

## Screen Recording

https://github.com/MetaMask/metamask-sdk/assets/61094771/10eb3ab3-6d44-4c8c-a635-796d4be24540



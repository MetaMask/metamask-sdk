# Creating a Custom MetaMask Modal in React

When integrating MetaMask into your React application, you might need to provide a custom user interface for certain interactions, such as displaying a modal when MetaMask is not installed. This documentation guides you through the process of creating and using a custom modal within the `MetaMaskProvider`.

## Overview

The `MetaMaskProvider` in `@metamask/sdk-react` allows you to integrate MetaMask into your React application seamlessly. One of the key features of this provider is the ability to define custom modals for various MetaMask interactions, such as prompting installation. This is achieved using the `modals` prop of the `MetaMaskProvider`.

## Step-by-Step Guide

### 1. Create a Custom Modal Component

You need to define a custom modal component. This component can be styled and behave according to your application's needs.

```javascript
import React from 'react';

const CustomModal = ({ onClose }) => {
  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default CustomModal;
```

### 3. Implement the Custom Modal Logic in MetaMaskProvider

When initializing `MetaMaskProvider`, you can pass a `modals` prop where you define custom behavior, like displaying a modal when MetaMask is not installed.

```javascript
import { MetaMaskProvider } from '@metamask/sdk-react';
import CustomModal from './CustomModal';

const App = () => {
  // ...

  return (
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
      {/* ... other components */}
    </MetaMaskProvider>
  );
};

export default App;
```

### 3. Integrate the Custom Modal with the Provider

In the example above, the `install` modal is overridden to display a `CustomModal` component. This modal will appear when MetaMask needs to be installed, utilizing the `mount` and `unmount` lifecycle methods to manage the modal's rendering.

### 4. Test Your Application

Run your React application and test the custom modal functionality. Ensure that the modal behaves as expected in scenarios like when MetaMask is not installed.

## Conclusion

Custom modals in MetaMask provide a flexible way to create a consistent and engaging user experience. By following the steps outlined above, you can implement a custom modal that fits the look and feel of your application.

For a detailed example on implementing a custom modal, check the `react-with-custom-modal` example in our repo.

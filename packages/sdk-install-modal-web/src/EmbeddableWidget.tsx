import preact, { h, render } from 'preact';
import InstallWidgetApp, { InstallWidgetProps } from './InstallWidget';
import widgetConfig from '../widget.config.json';
import PendingWidget, { PendingWidgetProps } from './PendingWidget';

export type Renderable = preact.AnyComponent | JSX.Element | preact.JSX.Element;

/**
  Wrapper around Widget, responsible for passing config and other options during widget usage on the
  host page
 */
export default class EmbeddableWidget {
  el: Element;
  component: Renderable;

  render = (parentElement: Element = null) => {
    if (this.el) {
      throw new Error(
        `${widgetConfig.widgetName} is already mounted, call unmount() first`
      );
    }
    this.el = document.createElement('div');
    if (parentElement) {
      parentElement.appendChild(this.el);
    } else {
      document.body.appendChild(this.el);
    }
    const element = parentElement || document.body;
    render(this.component, element);
  };

  mount = (props: InstallWidgetProps) => {
    this.component = <InstallWidgetApp {...props} />;
    const { parentElement } = props;
    if (document.readyState === 'complete') {
      this.render(parentElement);
    } else {
      window.addEventListener('load', () => {
        this.render(parentElement);
      });
    }
  };

  mountPending = (props: PendingWidgetProps) => {
    this.component = <PendingWidget {...props} />;
    const { parentElement } = props;
    if (document.readyState === 'complete') {
      this.render(parentElement);
    } else {
      window.addEventListener('load', () => {
        this.render(parentElement);
      });
    }
  }

  updateOTPValue = (otpValue: number) => {
    const otpNode = document.getElementById('sdk-mm-otp-value');
    if(otpNode) {
      otpNode.textContent = otpValue + '';
    }
  }

  unmount = () => {
    if (!this.el) {
      throw new Error(
        `${widgetConfig.widgetName} is not mounted, call mount() first`
      );
    }
    render(null, this.el);
    this.el.parentNode.removeChild(this.el);
    this.el = null;
  };
}

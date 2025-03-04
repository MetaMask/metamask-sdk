export type MetamaskElement = WebdriverIO.Element;
export type DappElement = WebdriverIO.Element;

export enum androidElementTypes {
  Button = 'android.widget.Button',
  TextView = 'android.widget.TextView',
  EditText = 'android.widget.EditText',
  ViewGroup = 'android.view.ViewGroup',
  View = 'android.view.View',
  Image = 'android.widget.ImageView',
  ScrollView = 'android.widget.ScrollView',
}

export default class Selectors {
  public static getAndroidLocatorByTextAndType(
    elementType: androidElementTypes,
    text: string,
  ) {
    const selector = `new UiSelector().text("${text}").className("${elementType}")`;
    return `android=${selector}`;
  }

  public static getAndroidLocatorByResourceId(
    elementType: androidElementTypes,
    resourceId: string,
  ) {
    const selector = `new UiSelector().resourceId("${resourceId}").className("${elementType}")`;
    return `android=${selector}`;
  }
}

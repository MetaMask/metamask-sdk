import {
  WDIO_ACCESSIBILITY_ID,
  WDIO_ANDROID_UI_AUTOMATOR,
  WDIO_IOS_PREDICATE_STRING,
  WDIO_RESOURCE_ID,
  WDIO_XPATH,
} from './Constants';

class WDIOSelector {
  /*
   * Returns the locator for the given accessibilityId
   * @param accessibilityId: string
   * */
  accessibilityId(accessibilityId: string): string {
    return `${WDIO_ACCESSIBILITY_ID}${accessibilityId}`;
  }

  /*
   * Returns the locator for the given xpath
   * @param xpath: string
   * */
  xpath(xpath: string): string {
    // Even though webdriver.io xpath selector is an empty string, it may change at any point
    return `${WDIO_XPATH}${xpath}`;
  }

  /*
   * Returns the locator for the given resource-id
   * @param resourceId: string
   * */
  resourceId(resourceId: string): string {
    return `${WDIO_RESOURCE_ID}${resourceId}`;
  }
}

export class AndroidSelector extends WDIOSelector {
  private readonly uiAutomatorPredicate = 'new UiSelector()';

  private uiAutomatorSelector = '';

  constructor() {
    super();
    this.uiAutomatorSelector = `${WDIO_ANDROID_UI_AUTOMATOR}${this.uiAutomatorPredicate}`;
  }

  uiAutomatorAndText(text: string): string {
    return this.uiAutomatorSelector.concat(`.text("${text}")`);
  }

  uiAutomatorAndClassName(className: string): string {
    return this.uiAutomatorSelector.concat(`.className("${className}")`);
  }

  uiAutomatorAndDescription(description: string): string {
    return this.uiAutomatorSelector.concat(`.description("${description}")`);
  }

  static by() {
    return new AndroidSelector();
  }
}

export class IOSSelector extends WDIOSelector {
  private predicateStringSelector = '';

  constructor() {
    super();
    this.predicateStringSelector = `${WDIO_IOS_PREDICATE_STRING}`;
  }

  predicateString(predicateString: string): string {
    return this.predicateStringSelector.concat(predicateString);
  }

  iosClassChain(classChain: string): string {
    return this.predicateStringSelector.concat(classChain);
  }

  static by() {
    return new IOSSelector();
  }
}

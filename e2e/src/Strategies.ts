export enum IOSSelectorStrategies {
  IOSClassChain = '-ios class chain:',
  IOSPredicateString = '-ios predicate string:',
  Xpath = '',
  AccessibilityID = '~',
  ResourceID = 'id:',
}

export enum AndroidSelectorStrategies {
  AccessibilityID = '~',
  Xpath = '',
  UIAutomator2 = 'android=',
  ResourceID = 'id:',
}

Feature: Onboarding in MetaMask

  Scenario: Onboarding in MetaMask
        A user opens the app for the first time and creates a new wallet

    Given The MetaMask mobile app is installed
    When I open the MetaMask mobile app
    And I tap on "Get Started"
    And I tap on "Create a new Wallet"
    And I tap on "No Thanks"
    And I fill the same Password
    And I tap the "Accept" checkbox
    And I tap on "Create password"
    And I tap on "Remind me later"
    And I tap the "Skip Security" checkbox
    And I tap on "Skip"
    Then I should see the "MetaMask Main" screen

  Scenario: Opening the Mobile Web browser
    Given I open Google Chrome
    When I enter the website "https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/test-dapp-2/"
    And I tap on "DappConnect"
    And I tap "Connect" on the permission request
    Then the "DappConnect" button should be "Not Clickable"

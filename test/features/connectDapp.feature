Feature: Connect each JS Dapp to MetaMask

  Scenario Outline: A user imports their SRP and connects to a Dapp
    Given The MetaMask mobile app is installed
    When I open the MetaMask mobile app
    And I tap "Get Started" on MetaMask
    And I tap "Import Wallet" on MetaMask
    And I tap "Dont Share Analytics" on MetaMask
    And I fill the "Secret Recovery Phrase" with "SRP"
    And I fill the "FirstPassword" with "asdasdasd"
    And I fill the "SecondPassword" with "asdasdasd"
    And I tap "Import" on MetaMask
    And I tap "No Security Updates" on MetaMask
    And I open Google Chrome
    When I enter the website "<WEBSITE>"
    And I tap the "Connect" button on the Dapp
    Then I am routed to MetaMask and I see the bottom prompt
    And I tap the "Approve" button on the MetaMask bottom prompt

    Examples: 
      | SDK_DAPP         | DEVICE  | WEBSITE       |
      | create-react-app | Android | http://:3000/ |

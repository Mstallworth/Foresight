Feature: Loader and results routing
  As a user, I want a dedicated results screen with a loader so the transition feels fast but credible.

  Scenario: Click "What other people are wondering" triggers a run
    Given I am on "/"
    When I click the card titled "What other people are wondering"
    Then I should see a loader with text "exploring the future"
    And within 2 seconds I should be on the "/results" screen

  Scenario: Manual generate triggers loader and results
    Given I enter "How might AI change my job as a product manager by 2028?"
    And I click "Generate"
    Then I should see a loader with text "exploring the future"
    And the results screen shows the card titled "Quick Take"

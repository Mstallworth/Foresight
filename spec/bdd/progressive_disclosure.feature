Feature: Progressive disclosure
  Scenario: Cards collapse by default
    Given I am on "/results"
    Then the "Quick Take" card shows at most 3 bullets by default

  Scenario: Expand reveals remaining bullets
    When I click "Expand" on the "Quick Take" card
    Then I see at least 6 bullets total

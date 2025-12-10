Feature: Credibility toggle
  Scenario: Toggle on reveals assumptions & confidence
    Given I am on "/results"
    When I toggle "Credibility" on
    Then I see text starting with "Assumptions"
    And I see "Confidence:" on the Quick Take card

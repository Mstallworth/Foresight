Feature: Artifact validity
  Scenario: Artifacts match schema
    Given I request generation with horizon 24
    Then the JSON output conforms to "artifacts.schema.json"

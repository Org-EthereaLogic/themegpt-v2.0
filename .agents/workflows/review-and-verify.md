---
description: Thoroughly review and independently verify the implementation
---

This workflow provides a structured approach for rigorously reviewing and independently verifying code changes or new implementations.

1. **Information Gathering**
   - Review the conversation history to understand the user's intent and specific requirements.
   - Check KI summaries for any existing architectural patterns, known issues, or project standards relevant to the changes.
   - List the modified files to get an overview of the implementation scope.

2. **Technical Code Review**
   - Examine the code changes in detail using `view_file` or `view_code_item`.
   - Verify that the implementation follows the project's coding standards and architectural patterns.
   - Look for potential edge cases, security vulnerabilities, or performance bottlenecks.
   - Ensure that comments and documentation are updated and accurate.

3. **Independent Verification**
   - **Crucial**: Do not take previous reports at face value. Re-verify everything independently.
   // turbo
   - Run applicable test suites using `npm test`, `pytest`, or the appropriate test runner for the project.
   - Perform static analysis using linting tools (e.g., `eslint`, `pylint`).
   - If UI changes are involved, use the browser tool to interact with the application and verify visual correctness and functionality.
   - Test various input scenarios, including invalid or boundary cases, to ensure robustness.

4. **Reporting and Documentation**
   - Create a `walkthrough.md` artifact to document the verification process.
   - Include specific evidence of verification (e.g., terminal output from tests, browser recordings).
   - Clearly state whether the implementation is approved or if further changes are required.
   - If issues are found, provide detailed feedback and suggestions for resolution.

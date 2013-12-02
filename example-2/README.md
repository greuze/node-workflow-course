Example 2
=========

The workflow is the same as previous example, and is instantiated when the appplication loads. Jobs are created with HTTP requests, and their progress can be checked with HTTP request.

Create job request example:
  http://localhost:3000/add-job?content=My-Content

Get job status  request example:
  http://localhost:3000/get-job?job-id=4a55241b-9b9a-45e3-917a-0b186cedb220
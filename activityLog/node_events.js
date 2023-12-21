const express = require("express");
const app = express();
const { spawn } = require("child_process");

app.listen(4000, () => {
  console.log("Application listening on port 4000!");
  // Run the Python script to capture events
  const pythonProcess = spawn("python", ["event_capture.py"]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python Script Output: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Script Error: ${data}`);
  });
});

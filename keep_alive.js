const express = require('express');
 const app = express();
 const PORT = process.env.PORT || 3000;

 // Example bot function
 function runBot() {
     console.log("Bot is running...");
    
const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();
      
      // Add your bot code here
 }

 // Endpoint to keep the server alive
 app.get('/', (req, res) => {
     res.send('Bot is running...');
 });

 // Start the bot
 runBot();

 // Start the server
 app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
 });
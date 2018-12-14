#!/usr/bin/env node

const { exec, spawn } = require("child_process");

const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/gm;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gm;

function parseClipboard() {
	return new Promise((resolve, reject) => {
		exec("pbpaste", (err, stdout, stderr) => {
			if (err || stderr) {
				reject(err || stderr);
			}

			const emails = stdout.match(emailRegex) || [];
			const phoneNums = stdout.match(phoneRegex) || [];

			resolve({ emails: new Set(emails), phoneNums: new Set(phoneNums) });
		});
	});
}


async function main() {
	try {
		const { phoneNums, emails } = await parseClipboard();
		console.log(`${phoneNums.size} phone numbers found in clipboard.`);
		console.log(`${emails.size} email addresses found in clipboard.`);

		const matches = [...phoneNums, ...emails].join("\n");
		const childProcess = spawn("pbcopy");
		childProcess.stdin.write(matches);
		childProcess.stdin.end();

		if (matches.length > 0) {
		console.log("Emails and phone numbers copied to clipboard!");
		}

		process.exit(0);
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
}

main();

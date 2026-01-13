📱 Limit-Centre Bot (WhatsApp)
---
This bot helps admins monitor the Limit Centre in WhatsApp groups.
It automatically reads messages in a specific format (M, R, N, L, K) and sends updates to the LIMIT_GROUP_JID.
---

🔹 Features

Real-time monitoring of selected WhatsApp groups

Supports message formats: M, R, N, L, K
Example:

M +5 K
R -2
N +10
L +3


Automatically sends messages to the Limit Centre group

Terminal logging with timestamp & emoji

Auto-reconnect if WhatsApp connection is lost

QR Code login for WhatsApp session
---

🧰 Requirements

Node.js v16+

WhatsApp account for the bot

Access to the groups you want to monitor

Terminal/server to run the bot (VPS, Replit, Heroku, etc.)
---

⚙️ Installation

Clone the repository

git clone https://github.com/imamskenn/limit-bot.git
cd limit-bot


Install dependencies

npm install


Create authentication folder

mkdir auth_info_bot


auth_info_bot will store WhatsApp session info so the bot won’t require repeated logins.

Configure Limit Centre groups

Open bot.js

Make sure LIMIT_GROUP_JID is correct:

const LIMIT_GROUP_JID = 'your group limit@g.us';


Update GROUP_CODES & GROUP_ALIAS to match your groups:

const GROUP_CODES = {
  'pengcm33(604)(n207)': { R: 604, N: 207 },
  ...
};
const GROUP_ALIAS = {
  'pengcm33(604)(n207)': 'PENG-CM',
  ...
};
---

🚀 Running the Bot
node bot.js


The terminal will display a banner

A QR Code will appear for WhatsApp login

Scan the QR with the bot account

Once connected, the bot will monitor groups and send updates to LIMIT_GROUP_JID

📝 Message Format

The bot only reads messages in this format:

M/R/N/L/K <+/- number> [K]


M → Master/Manual

R → Group R / hundreds

N → Group N / number

L → Group L

K → Optional extra indicator

The bot will send messages to the Limit Centre with group alias & line code
---

📊 Logging

Example terminal log:

🟩 12:45 | PENG-CM | M +5 K | SENT
❌ FAILED TO SEND


Emoji indicates message type (M, R, N, L, K)

Timestamp follows local timezone (id-ID)

❌ shows if sending failed

⚡ Tips

Auto-reconnect handles lost connections

Make sure the bot is admin in all monitored groups to read messages

Use a VPS or PC 24/7 to keep the bot active
---

📦 Repository Structure
limit-bot/
├── bot.js              # Main bot script
├── package.json        # Dependencies
├── auth_info_bot/      # WhatsApp session storage
└── node_modules/
---

🛠️ Deployment
Heroku

Upload the repo to Heroku

Set NODE_ENV=production

Persist auth_info_bot folder (using custom buildpack or volume)

Deploy and run

Replit

Import the repository

Add auth_info_bot as persistent storage

Run node bot.js

Scan QR from terminal
---

⚖️ License

This bot is free to use for internal purposes only.
Use responsibly ⚠️

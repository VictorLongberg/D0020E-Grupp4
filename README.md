# D0020E-Grupp4
### Köhantering och chatt för distansstudier

### Installation
Projektet beror på Node.js och dess pakethantetrare npm samt en mongodb databas
så se till att dessa är installerade innan du börjar med installationen.
Plattformsberoende instruktioner för att installera Node.js finns här
[Node.js install](https://nodejs.org/) npm installeras med Node.js.
Hur man sätter upp mongodb finns det instruktioner för här
[mongodb setup](https://www.mongodb.com/try).

1. Klona detta repot:
	```sh
	$ git clone https://github.com/s7rul/D0020E-Grupp4.git
	```
	eller ladda ner den senaste utgåvan.

2. Ta dig till mappen med koden:
	```sh
	$ cd D0020E-Grupp4
	```
3. Installera beroenden:
	```sh
	$ npm install
	```
4. Set upp databasen genom att gå till ```app.js``` och fyll i rätt information
	där det står:
	```javascript
	const MongoClient = require('mongodb').MongoClient;
	const url = 'Your URL here.'; <---- Ändra här

	async function findMessageById(id) {
	```
5. Starta servern genom att köra:
	```sh
	$ node app
	```
	Installationen är nu klar och lärar respektive student vyerna ska nu
	kunna nås på [127.0.0.1:3000/teacher](http://127.0.0.1:3000/teacher) samt
	[127.0.0.1:3000/student](http://127.0.0.1:3000/student).

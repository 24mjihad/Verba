setTimeout(() => { // waiting for keyboard to be detected before we do anything
	const observer = new MutationObserver(function (mutationsList, observer) {
		const targetElement = document.querySelector('.Keyboard-module_keyboard__uYuqf');
		if (targetElement) { // Select the board and keyboard elements for usage later
			const board = document.querySelector('.Board-module_board__jeoPS');
			const rows = board.querySelectorAll('.Row-module_row__pwpBq');
			const keyboardContainer = document.querySelector('.Keyboard-module_keyboard__uYuqf');
			document.body.style.zoom = "0.6";


			// Determine if user is in dark or light mode --------------

			const button = document.querySelector('button[data-key="↵"]');

			// Get the styles of the button
			const computedStyle = window.getComputedStyle(button);
			// Get the value of --color-background
			const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();
			let dark = true;
			// to detmerine if in lightmode or darkmode
			if (backgroundColor === "#fff") {
				dark = false;
			}
			console.log("dark:", dark);

			// -----------------------------------------------------------

			// Check if the element exists and then change its width to make everything fit better
			if (keyboardContainer) {
				keyboardContainer.style.width = '600px';
			}


			// creating an element to push our filtered list to onto the website
			const listContainer = document.createElement("ul");
			listContainer.id = "myList";

			// styleing the list list container
			listContainer.style.fontSize = "100px";
			listContainer.style.fontWeight = "bold";
			listContainer.style.color = "blue";
			listContainer.style.margin = "50px";
			listContainer.style.padding = "40px";
			listContainer.style.marginBottom = "200px";

			document.body.appendChild(listContainer);

			// Create an array of items this is used for pushing to website
			let myArray = [];
			// populating possibleWords array ---------------------------------------
			let possibleWords = [];
			fetch(chrome.runtime.getURL('answerlist.txt')).then(response => response.text()).then(text => {
				possibleWords = text.split('\n').map(word => word.trim());
				console.log("Possible words loaded:", possibleWords);
			}).catch(err => console.error("Error loading word list:", err));

			const dict = [];
			const list = [];
			// Store arrays for absent, present in another position, and correct letters
			const abs = [];
			const pres = [
				[],
				[],
				[],
				[],
				[]
			];
			const cor = [
				[],
				[],
				[],
				[],
				[]
			];
			// ---------------------------------------
			// 0 1 2 3 4
			// Loop through each row and insert a button dynamically
			rows.forEach((row, index) => {
				const button = document.createElement('button');
				button.textContent = `Calculate with Row ${
					index + 1
				} Letters`;
				button.id = `row${
					index + 1
				}Button`;
				button.addEventListener('click', function () { // Get the letters for the specific row
					const rowLetters = Array.from(row.querySelectorAll('[aria-label]')).map(tile => tile.getAttribute('aria-label'));
					console.log(`Captured Row ${
						index + 1
					} Letters:`, rowLetters);

					const seenLetters = new Set();

					const duplicateLetters = new Set();

					rowLetters.forEach((letterInfo) => {
						const [position, letter, status] = letterInfo.split(',').map(item => item.trim());

						// Check if the letter has already been seen
						if (seenLetters.has(letter)) {
							duplicateLetters.add(letter); // Add to duplicate set if it's a duplicate
						} else { // Add the letter to the seen set
							seenLetters.add(letter);
						}
					});

					const duplicateWord = Array.from(duplicateLetters).sort().join('');

					const isEmpty = duplicateWord === '';

					// populate to abs when letter is detected
					rowLetters.forEach((letterInfo, letterIndex) => {
						const [position, letter, status] = letterInfo.split(',').map(item => item.trim());
						const letterStatus = status.toLowerCase();
						if (letterStatus === 'absent') {
							if (! duplicateWord.includes(letter)) {
								abs.push(letter);
							}
						}
					});
					// ABSENT -------------------------------------------------
					// if first time running
					if (index < 1) {

						for (const word of possibleWords) { // Check if any letter in `abs` exists in the word
							let hasForbiddenLetter = false;

							for (const letter of abs) {
								if (word.toUpperCase().includes(letter)) {
									hasForbiddenLetter = true;

									break;
								}
							}

							if (! hasForbiddenLetter) {
								list.push(word);
							}
						}
					} else {

						for (let i = 0; i < list.length; i++) {
							const word = list[i];
							let hasForbiddenLetter = false;

							// Check if any letter in `abs` exists in the word
							for (const letter of abs) {
								if (word.toUpperCase().includes(letter)) {
									hasForbiddenLetter = true;
									break;
								}
							}

							if (hasForbiddenLetter) {
								list.splice(i, 1);
								i--;

							}
						}
					}
					// -------------------------------------------------------------
					// populate pres array when letter is detected
					rowLetters.forEach((letterInfo, letterIndex) => {
						const [position, letter, status] = letterInfo.split(',').map(item => item.trim());
						const letterStatus = status.toLowerCase();
						if (letterStatus === 'present in another position') { // Ensure that position is a valid index (0-4)
							const positionIndex = parseInt(position); // Convert to integer
							if (positionIndex >= 0 && positionIndex < 6) {
								if (! pres[positionIndex - 1].includes(letter)) {
									pres[positionIndex - 1].push(letter); // Safe to push here
								}
								console.log(`Letter ${letter} is present but not in position ${position}`);
							} else {
								console.error(`Invalid position ${position} detected!`);
							}
						}
					});
					// if doens't have letters in pres then eliminate
					// PRESENT ---------------------------------------------------------
					for (let i = 0; i < list.length; i++) {
						const word = list[i];
						let haspres = false;

						// Check if any letter in `pres` exists in the word
						for (const letter of pres) { // Check if the word contains any forbidden letter (case insensitive)
							if (letter.length < 2) {
								if (! word.toUpperCase().includes(letter)) {
									haspres = true;

									break; // No need to check further letters
								}
							} else {
								for (const l of letter) {
									if (! word.toUpperCase().includes(l)) {
										haspres = true;
										break;
									}
								}
							}
						}

						if (haspres) {
							list.splice(i, 1);
							i--;
						}
					}


					for (let i = 0; i < list.length; i++) {
						const word = list[i];
						let rem = false;
						let pos = 0;
						for (const letters of pres) {

							if (letters.length < 2) {
								if (letters.length === 0) {} else {

									let letter = letters[0].toLowerCase();


									if (word.indexOf(letter) === pos) {
										rem = true;
										break;
									}
								} pos++;
							} else {
								for (const lr of letters) {
									let l = lr[0].toLowerCase();

									if (word.indexOf(l) === pos) {
										rem = true;
									}
								}
								pos++;

							}
						}
						if (rem) {
							list.splice(i, 1);
							i--;
						}
					}
					console.log("Filtered list:", list);

					// --------------------------------------------------------------------------------
					// populates cor array when letter is detected
					rowLetters.forEach((letterInfo, letterIndex) => {
						const [position, letter, status] = letterInfo.split(',').map(item => item.trim());
						const letterStatus = status.toLowerCase();
						if (letterStatus === 'correct') {

							const positionIndex = parseInt(position);
							if (positionIndex >= 0 && positionIndex < 6) {
								if (! cor[positionIndex - 1].includes(letter)) {
									cor[positionIndex - 1].push(letter);
								}
								console.log(`Letter ${letter} is in position ${position}`);
							} else {
								console.error(`Invalid position ${position} detected!`);
							}
						}

					});

					// CORRECT ---------------------------------------------------------------------------------
					for (let i = 0; i < list.length; i++) {
						const word = list[i];
						let hasCorr = true;

						let pos = 0;
						for (const letters of cor) {
							if ((letters.length === 0)) {
								pos++;
							} else {


								let letter = letters[0].toLowerCase();

								console.log(letter[0]);
								console.log(pos);
								console.log(word);
								console.log("index:", word.indexOf(letter[0]), "pos:", pos);
								console.log("-----------------");
								// if (!(word.indexOf(letter[0])===pos)){
								if (word[pos] != letter[0]) {
									hasCorr = false;
									console.log("remove:", word);
									console.log("-----------------");

								}

								pos++;
							}
						}

						// If the word contains a forbidden letter, remove it from the list

						if (! hasCorr) {
							list.splice(i, 1); // Remove the word at index i
							i--;
						}

					}
					console.log("cor:", list);
					// -----------------------------------------------------------------------------------------------
					// push only 10 words from our list to myArray which we will display
					myArray = [];
					myArray.push(list.slice(0, 10));
					// adds li elements
					myArray.forEach(item => {
						const listItem = document.createElement("li");
						listItem.textContent = item;

						listItem.style.fontSize = "25px";
						listItem.style.marginBottom = "20px";
						// changes color of text based on what mode user is in!
						if (dark) {
							listItem.style.color = "white";
						} else {
							listItem.style.color = "black";
						} listItem.style.maxWidth = "600px";
						listItem.style.whiteSpace = "unwrap";
						listItem.style.overflow = "hidden";
						listItem.style.textOverflow = "ellipsis";


						listContainer.appendChild(listItem);
					});


				});

				const nextRow = rows[index + 1];
				if (nextRow) {
					board.insertBefore(button, nextRow);
				} else {
					board.appendChild(button);
				}
			});


			observer.disconnect();
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});

}, 1000);

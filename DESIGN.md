# Verba design

## Overview
This JavaScript extension fetches a list of possible words from a text file and filters them dynamically and outputs it on to the website based on the user’s guesses.

3. **Interactive Row Buttons**:
   - For each row on the board, a button is created that captures the letters in the row, processes their status, and filters the word list accordingly.
   - Buttons are added dynamically before each row and remove words from the possible list that do not match the input clues.


## Detailed Code

1. **Initialization**: 
   - A `MutationObserver` is used to determine if user is in the play area and that everything is loaded. We use this Observer to check if keyboard is loaded. Once it is detected we proceeded with the code. 
   - The `setTimeout` function ensures that there is a short delay before script run.


2. **UI Adjustments**:
   - Once the keyboard element is detected, the page’s zoom is reduced (set to `0.6`), and the width of the keyboard container is set to 600px.This ensure that there is enough screen space to add buttons so that elements don't overlap.

    - **Dark-light mode detection**

        - we loook at the color of an element on the page to determine if the user is in **dark** or **light** mode which we use to determine the color of the elements we add to the page
        ```javascript
        const computedStyle = window.getComputedStyle(button);

        const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();

        let dark= true;

        if (backgroundColor === "#fff"){
            dark=false;
        }
    - **Interactive Row Buttons**:
        - For each row on the board, a button is created that captures the letters in the row, processes their status, and filters the word list accordingly.
        - Buttons are added below the row


3. **Word bank**:
   - The script fetches the list of possible words from `answerlist.txt` using the `fetch` API.
   - It splits the text file into individual words, removing any extra whitespace and puts it into an array so that we can interact with it.
   
4. **User Input Processing**:
   - Each row of the board is analyzed for its letters' status (absent, present, or correct).
   - Letters that are marked **absent** are added to an array of forbidden letters.
        ```javascript
        const abs = [];
   - Letters that are **present** but in a different position are tracked.
        ```javascript
        const pres = [[], [], [], [], []];
   - Letters that are **correct** are fixed in their respective positions.
        ```javascript
        const cor = [[], [], [], [], []];
    *note: we use **1d array** for abs because we don't care what positon it is in but use **2d arry** for present and correct because we want to keep track of index*
5. **Word Filtering**:
   - The possible words list is filtered multiple times:
     - **Absent Letters**:
        - Any word containing an absent letter is excluded.
     - **Present Letters in Another Position**: 
        - Any word without present letters are excluded
        - Any words with present letters in the same index as in pres array is excluded
            - The logic here is this: if we know at index 0 of word, A is present but in another position then we know it can't be any word that starts with A
     - **Correct Letters**: Words that do not match the correct letters in the exact positions are filtered out.
   - The final list of words is updated after processing each row.

6. **Display Filtered Words**:
   - After filtering, the top 10 words are displayed in the UI. Each word is styled for readability with large, bold, white or black text (depending on dark or light mode).
   





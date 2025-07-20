export function isVlidName(name: string) {
    return /^[a-zA-z]{2,}/.test(name.trim());
}


export function isValidPhoneNumber(phone: string) {
    return /^[0-9]{10,12}/.test(phone.trim());
}


export function fuzzyScore(input: string, contact: string): number {
    // comapare the name from the phone book with the name in the input
    // Matching algorithm for all characters and the order in which they apppear.
    // keep a score for every character order
    // if some characters are consecutive give bonus points.
    // penalize for extra distance or mismatches;

    // give a point for every match in the sequence
    // remove a point for extra distance and mismatches;
    // const score = fuzzyScore(input_name, contact_name)

    // store the name together with the score;
    // sort the scores and store them in descending order

    // print the names with scores that are on top of the list

    input = input.toLowerCase();
    contact = contact.toLowerCase();


    let inputIndex = 0;
    let contactIndex = 0;
    let lastMatchPos = -1;
    let score = 0;

    while (inputIndex < input.length && contactIndex < contact.length) {
        const currentMatchPos = contactIndex;

        // check if there is a match
        if (input[inputIndex] === contact[contactIndex]) {
            // check if it isn't the first match
            if (lastMatchPos !== -1) {
                const gap = currentMatchPos - lastMatchPos;

                if (gap === 1) score += 2;
                else score -= 1;
            }

            if (contactIndex === 0 || contact[contactIndex - 1] === " ") {
                score += 1;
            }

            if (contact[contactIndex] === contact[contactIndex]?.toUpperCase() && input[inputIndex] === contact[contactIndex]) {
                score += 2; // abbreviation match
            }

            score += 1;
            lastMatchPos = currentMatchPos;
            inputIndex++ // move to the next charcter in the input name;
        }

        contactIndex++ // advance to the next contact_name
    }

    return Math.max(score, 0);
}


export function searchContacts(query: string, phonebook: {name: string}[]){
    const results: {name: string, score: number}[] = [];

    for(const c of phonebook){
        const contact_name = c.name.toLowerCase();

        let score = fuzzyScore(query, contact_name);

        // store the score if greater than zero
        if(score > 0){
            results.push({name: c.name, score})
        }
    }

    return results.sort((a, b) => b.score - a.score)
}
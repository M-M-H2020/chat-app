const Filter = require('bad-words');
const filter = new Filter();

filter.removeWords('hell','hells','sadist')

exports.generateMessage = (username,text) => {
    return {
		username,
        text,
        createdAt: new Date().getTime()
    }
}
exports.generateLocationMessage = (username,URL) => {

	return {
		username,
		URL,
		createdAt: new Date().getTime()
	}
}


exports.sanitize = (msg)=> {
	const words = msg.split(' ');
	const newMsg = [];
	for (let word of words) {
		if (filter.isProfane(word)) {
			const splittedWord = word.split('');
			const list = [];
			for (let letter of splittedWord) {
				letter = '*';
				list.push(letter);
			}
			list[0] = splittedWord[0];
			list[list.length - 1] = splittedWord[splittedWord.length - 1];
			newMsg.push(list.join(''));
		} else {
			newMsg.push(word);
		}
	}
	return newMsg.join(' ');
}
const express = require('express');
const bodyparser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: false
}));

//Utility functions
var randomIntBelow = (n) => Math.floor(Math.random() * n);
var randomIntBetween = (a, b) => Math.floor(Math.random() * (b - a) + a);

app.post('/substraction', (req, res) => {
    var params = req.body;
    if (!req.body || !params.minuend || !params.subtrahend || params.borrowing == undefined || !params.questions)
        res.status(400).json({
            "error": "Required parameters missing"
        })
    if (params.minuend < params.subtrahend)
        res.status(400).json({
            "error": "Subtrahend had to be less than minuend"
        })
    var maxMinuend = Math.pow(10, params.minuend);
    var maxSubtrahend = Math.pow(10, params.subtrahend);
    var result = new Array(params.questions);
    var difficultyFactor = Math.pow(10, params.difficulty || params.subtrahend);
    for (i = 0; i < params.questions; i++) {
        var minuend = randomIntBetween(maxMinuend / 10, maxMinuend);
        var subtrahend;
        if (params.borrowing) {
            var randomDigit;
            if (params.minuend == params.subtrahend) //To avoid negative answers
            {
                subtrahend = randomIntBetween(maxSubtrahend / 10, minuend);
                randomDigit = randomIntBetween(1, params.subtrahend - 1);
            } else {
                subtrahend = randomIntBetween(maxSubtrahend / 10, maxSubtrahend);
                randomDigit = randomIntBetween(1, params.subtrahend);
            }
            //To make sure at least one digit is larger for borrowing.
            digit = Math.floor(subtrahend % Math.pow(10, randomDigit) / Math.pow(10, randomDigit - 1));
            subtrahend -= Math.floor(digit * Math.pow(10, randomDigit - 1));
            subtrahend += Math.floor(randomIntBetween(digit + 1, 10) * Math.pow(10, randomDigit - 1));
        } else {
            var position = 1;
            var digit;
            subtrahend = 0;
            while (position < params.subtrahend) {
                digit = Math.floor(minuend % Math.pow(10, position) / Math.pow(10, position - 1));
                subtrahend = subtrahend + Math.pow(10, position - 1) * randomIntBetween(0, digit + 1);
                position++;
            }
            digit = Math.floor(minuend % Math.pow(10, position) / Math.pow(10, position - 1));
            if (digit == 0) //if last digit is zero not possible to not borrow, so change minuend
            {
                digit = randomIntBetween(1, 10);
                minuend += digit * Math.pow(10, position - 1);
            }
            subtrahend = subtrahend + Math.pow(10, position - 1) * randomIntBetween(1, digit + 1);
        }
        var answer = minuend - subtrahend;
        var options = new Array(4);
        for (j = 0; j < options.length; j++) {
            var temp = answer + randomIntBelow(difficultyFactor) * (Math.random() > 0.5 ? 1 : -1);
            temp = Math.abs(temp);
            if (options.includes(temp)) j--;
            else options[j] = temp;

        }
        if (!options.includes(answer))
            options[randomIntBelow(options.length)] = answer;
        result[i] = {
            minuend,
            subtrahend,
            answer,
            options
        };
    }


    res.status(200).json({
        "questions": result
    });
});

app.get('/', (req, res) => {
    res.status(200).send(`Hello World! Our server is running at port ${port}`);
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
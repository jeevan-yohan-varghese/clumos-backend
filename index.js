const express = require('express');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello World!');
}
);


app.listen(process.env.PORT || 5000, () => {
    console.log('Example app listening on port 5000!');
}
);

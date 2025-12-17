import express from 'express';

const app = express();
const port = process.env.PORT || 3003;

app.get('/', (req, res) => {
    res.send('Transaction Service');
});

app.listen(port, () => {
    console.log(`Transaction service listening at http://localhost:${port}`);
});

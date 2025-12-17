import express from 'express';

const app = express();
const port = process.env.PORT || 3004;

app.get('/', (req, res) => {
    res.send('Customer Service');
});

app.listen(port, () => {
    console.log(`Customer service listening at http://localhost:${port}`);
});

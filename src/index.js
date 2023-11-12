const express = require("express")
const path = require("path")
const app = express()
// const hbs = require("hbs")
const LogInCollection = require("./mongo")
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const templatePath = path.join(__dirname, '../templates')
const publicPath = path.join(__dirname, '../public')
const jwt = require("jsonwebtoken");
console.log(publicPath);


//app.set('view engine', 'hbs')
//app.set('views', templatePath)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(publicPath))


// hbs.registerPartials(partialPath)


app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})



app.get('/home', (req, res) => {
    res.render('home')
})


app.post('/signup', async (req, res) => {
    try {
        const { nickname, password } = req.body;

        // Check if the nickname already exists
        const existingUser = await LogInCollection.findOne({ nickname });
        if (existingUser) {
            return res.status(400).json({ error: 'Nickname already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await LogInCollection.create({ nickname, password: hashedPassword });

        const accessToken = jwt.sign({ id: newUser._id, nickname: newUser.nickname }, 'e85fe3b80c3e531636d4e4680f9a1ad06c7ea4d80a1d4f1316ff653643da4e48', { expiresIn: '15m' });

        // Generate a refresh token
        const refreshToken = jwt.sign({ id: newUser._id, nickname: newUser.nickname }, 'bcd04f442dbf188edb3986a02fe36ff08b3b1bd6785deb1b8313d4c69592ccda\n', { expiresIn: '7d' });

        res.render('signup', { accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});



app.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body;

        // Find the user by nickname
        const user = await LogInCollection.findOne({ nickname });

        // If the user doesn't exist or the password is incorrect, return an error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid nickname or password' });
        }

        // Generate an access token
        const accessToken = jwt.sign({ id: user._id, nickname: user.nickname }, 'e85fe3b80c3e531636d4e4680f9a1ad06c7ea4d80a1d4f1316ff653643da4e48', { expiresIn: '15m' });

        // Generate a refresh token
        const refreshToken = jwt.sign({ id: user._id, nickname: user.nickname }, 'bcd04f442dbf188edb3986a02fe36ff08b3b1bd6785deb1b8313d4c69592ccda\n', { expiresIn: '7d' });

        res.render('login', { accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}

app.get('/protected', authenticateToken, (req, res) => {
    // Only authenticated users can access this endpoint
    res.json({ message: 'Protected endpoint' });
});

app.listen(port, () => {
    console.log('port connected');
})
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import {registerValidation, loginValidation, postCreateValidation} from './validations.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';
import pkg from 'nodemon';
import handleValidationErrors from "./utils/handleValidationErrors.js";
const { on, once } = pkg;



mongoose.connect(
    'mongodb+srv://admin:admin@cluster0.fm1uf.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        tls: true,
        tlsAllowInvalidCertificates: true
    }
).then(() => console.log('Connected to DB successfully'))
    .catch((err) => {
        console.error('Error connecting to DB:', err.message);
        if (err.name === 'MongoNetworkError') {
            console.error('Is MongoDB running? Check connection string');
        }
    });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB Atlas');
});



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
    destination:(_,__,cb) =>{
        cb(null, 'uploads');
    },
    filename:(_,file,cb) =>{
        cb(null, 'file.originalname');
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Ограничиваем размер файла до 5 МБ
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only .jpg and .png files are allowed!'), false);
        }
    }
});

app.use('/uploads', express.static('uploads'));

app.post('/auth/login',loginValidation,handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation,handleValidationErrors,UserController.reqister);
app.get('/auth/me',checkAuth ,UserController.getMe);

app.post('/upload',checkAuth, upload.single('image'), (req, res)=>{
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});


app.get('/posts',PostController.getAll);
app.get('/posts:id',PostController.getOne);
app.post('/posts',checkAuth ,postCreateValidation,handleValidationErrors,PostController.create);
app.delete('/posts:id',checkAuth,PostController.remove);
app.patch('/posts:id',checkAuth,postCreateValidation,handleValidationErrors,PostController.update);

const port = process.env.PORT || 4444;
app.listen(port, (err) => {
    if(err){
        return console.log(err);
    }

    console.log('Server OK')
});
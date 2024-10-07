import PostModel from "../models/Post.js";
import mongoose from "mongoose";

export const getAll = async (req, res) =>{
    try{
        const posts = await PostModel.find().populate('user').exec();

        res.json(posts);
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:'Не удалось найти статьи',
        });
    }
};

export const getOne = async (req, res) => {
    try {
        let postId;

        //console.log('Received params:', req.params);
        //console.log('Received id:', req.params.id);

        // Проверка id на существование
        if (!req.params.id) {
            return res.status(400).json({
                message: 'ID не найден в параметрах запроса',
            });
        }

        // Удаление символа двоеточие из начала строки
        const cleanId = req.params.id.replace(/^:/, '');

        //console.log('Cleaned id:', cleanId);

        // Проверяем формат ID
        if (!/^[0-9a-f]{24}$/.test(cleanId)) {
            return res.status(400).json({
                message: 'Неверный формат ID',
                error: 'ID должен быть 24-значным шестнадцатеричным строком или целым числом',
            });
        }

        // Попытка преобразовать в ObjectId
        try {
            postId = new mongoose.Types.ObjectId(cleanId);
            //console.log('Parsed Post ID:', postId);
        } catch (err) {

            let parsedId;
            try {
                parsedId = parseInt(cleanId);
                //console.log('Parsed Post ID as integer:', parsedId);
            } catch (err) {
                return res.status(400).json({
                    message: 'Неверный формат ID',
                    error: 'ID должен быть 24-значным шестнадцатеричным строком или целым числом',
                });
            }
            postId = parsedId;
        }

        // Дополнительная проверка на уровне модели
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Неверный формат ID',
                error: 'ID должен быть корректным ObjectId',
            });
        }

        const result = await PostModel.findOneAndUpdate(
            { _id: postId },
            { $inc: { viewsCount: 1 } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({
                message: 'Статья не найдена',
            });
        }

        res.json(result);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({
            message: 'Не удалось найти статью',
            error: err.message
        });
    }
};

export const create = async (req, res) => {
    try{
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        });

    const post = await doc.save();
    res.json(post);
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:'Не удалось создать статью',
        });
    }
};

export const remove = async (req, res) => {
    try {
        let postId;

        //console.log('Received params:', req.params);
        //console.log('Received id:', req.params.id);


        if (!req.params.id) {
            return res.status(400).json({
                message: 'ID не найден в параметрах запроса',
            });
        }


        const cleanId = req.params.id.replace(/^:/, '');

        //console.log('Cleaned id:', cleanId);


        if (!/^[0-9a-f]{24}$/.test(cleanId)) {
            return res.status(400).json({
                message: 'Неверный формат ID',
                error: 'ID должен быть 24-значным шестнадцатеричным строком или целым числом',
            });
        }


        try {
            postId = new mongoose.Types.ObjectId(cleanId);
            //console.log('Parsed Post ID:', postId);
        } catch (err) {

            let parsedId;
            try {
                parsedId = parseInt(cleanId);
                //console.log('Parsed Post ID as integer:', parsedId);
            } catch (err) {
                return res.status(400).json({
                    message: 'Неверный формат ID',
                    error: 'ID должен быть 24-значным шестнадцатеричным строком или целым числом',
                });
            }
            postId = parsedId;
        }


        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Неверный формат ID',
                error: 'ID должен быть корректным ObjectId',
            });
        }

        const result = await PostModel.findOneAndDelete(
            { _id: postId }
        );

        if (!result) {
            return res.status(404).json({
                message: 'Статья не найдена',
            });
        }

        res.json({
            success: true,
            deletedId: result._id,
        });

    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({
            message: 'Не удалось найти статью',
            error: err.message
        });
    }
};

export const update = async (req, res) => {
    try {
        let postId;

        //console.log('Received params:', req.params);
        //console.log('Received id:', req.params.id);


        if (!req.params.id) {
            return res.status(400).json({
                message: 'ID не найден в параметрах запроса',
            });
        }


        const cleanId = req.params.id.replace(/^:/, '');

        //console.log('Cleaned id:', cleanId);


        if (!/^[0-9a-f]{24}$/.test(cleanId)) {
            return res.status(400).json({
                message: 'Неверный формат ID',
                error: 'ID должен быть 24-значным шестнадцатеричным строком или целым числом',
            });
        }


        try {
            postId = new mongoose.Types.ObjectId(cleanId);
            console.log('Parsed Post ID:', postId);
        } catch (err) {

            let parsedId;
            try {
                parsedId = parseInt(cleanId);
               // console.log('Parsed Post ID as integer:', parsedId);
            } catch (err) {
                return res.status(400).json({
                    message: 'Неверный формат ID',
                    error: 'ID должен быть 24-значным шестнадцатеричным строком или целым числом',
                });
            }
            postId = parsedId;
        }


        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'Неверный формат ID',
                error: 'ID должен быть корректным ObjectId',
            });
        }

        const result = await PostModel.updateOne(
            { _id: postId },
            {
                $set: {
                    title: req.body.title,
                    text: req.body.text,
                    imageUrl: req.body.imageUrl,
                    tags: req.body.tags,
                    user: req.userId,
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                message: 'Статья не найдена или не была обновлена',
            });
        }

        res.json({
            success: true,
            //updatedId: postId,
            //modifiedCount: result.modifiedCount,
        });

    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({
            message: 'Не удалось обновить статью',
            error: err.message
        });
    }
};




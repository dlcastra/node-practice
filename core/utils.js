import {JWT_SECRET} from "./settings.js";
import {JWToken} from "../models/tokenModel.js";

import jwt from 'jsonwebtoken';

const generateToken = async (user) => {
    const token = jwt.sign({
        _id: user._id,
        email: user.email
    }, JWT_SECRET, {expiresIn: "3d"});

    const tokenEntry = new JWToken({token, userEmail: user.email});
    await tokenEntry.save();

    return token;
};


const checkTokenCount = async (req) => {
    const {email} = req.body;

    const tokenCount = await JWToken.countDocuments({userEmail: email});
    if (tokenCount > 3) {
        const tokensToDelete = await JWToken.find({userEmail: email})
            .sort({createdAt: 1})
            .limit(tokenCount - 3)

        const tokenIds = tokensToDelete.map(token => token._id);
        await JWToken.deleteMany({_id: {$in: tokenIds}});
    }

    return JWToken.find({userEmail: email}).sort({createdAt: -1}).limit(3);
};

export {generateToken, checkTokenCount};

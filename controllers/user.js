import bcrypt, { hash } from 'bcrypt';

import { userModel } from "../models/user.js";
import { generateToken } from "../utils/generateToken.js";

// שליפת כל המשתמשים 
export const getAllUser = async (req, res) => {
    try {
        let data = await userModel.find().select('-password');
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ title: "cannot get all user", message: err.message });
    }
};

// שליפת משתמש לפי ID
export const getById = async (req, res) => {
    let { id } = req.params;
    try {
        let data = await userModel.findById(id).select('-password');
        if (!data) return res.status(404).json({ title: "cannot find by id", message: "user with such id not found" });
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(400).json({ title: "cannot get by id", message: err.message });
    }
};

// הוספת משתמש
export const addUser = async (req, res) => {
    let { body } = req;

    // בדיקת חובה
    if (!body.password || !body.email) {
        return res.status(400).json({ title: "cannot add user", message: "password and email are required" });
    }

    // בדיקת חוזק סיסמה
    if (!(body.password.length >= 6 && (body.password.match(/\d/g) || []).length >= 4 && (body.password.match(/[a-zA-Z]/g) || []).length >= 2)) {
        return res.status(400).json({ title: "invalid password", message: "password must be at least 6 characters long, contain at least 4 numbers and 2 letters" });
    }

    try {
        // בדיקת קיום משתמש עם אותו אימייל
        let existingUser = await userModel.findOne({ email: body.email });

        if (existingUser) {
            return res.status(400).json({ title: "email already exists", message: "A user with this email already exists" });
        }

        // **הצפנת הסיסמה לפני יצירת המשתמש**
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);

        // יצירת משתמש חדש עם הסיסמה המוצפנת
        let newUser = new userModel({ ...body, password: hashedPassword });

        await newUser.save();

        res.json(newUser);
    } catch (err) {
        console.log(err);
        res.status(400).json({ title: "cannot add this user", message: err.message });
    }
};
// עדכון פרטי משתמש חוץ מסיסמא
export const update = async (req, res) => {
    let { id } = req.params;
    let body = req.body;
    if (body.password)
        return res.status(404).json({ title: "cannot update password", message: "cannot update password here" });
    try {
        let data = await userModel.findByIdAndUpdate(id, body, { new: true });
        if (!data) return res.status(404).json({ title: "cannot update by id", message: "user with such id not found" });
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(400).json({ title: "cannot update", message: err.message });
    }
};

// עדכון סיסמא
export const updatePassword = async (req, res) => {
    let { id } = req.params;
    let body = req.body;
    if (!body.password || body.userName || body.email)
        return res.status(400).json({ title: "only update password", message: "cannot update email or userName" });

    if (!(body.password.length >= 6 && (body.password.match(/\d/g) || []).length >= 4 && (body.password.match(/[a-zA-Z]/g) || []).length >= 2))
        return res.status(400).json({ title: "invalid password", message: "password must be at least 6 characters long, contain at least 4 numbers and 2 letters" });

    try {
        let data = await userModel.findByIdAndUpdate(id, { password: body.password }, { new: true });
        if (!data) return res.status(404).json({ title: "cannot update by id", message: "user with such id not found" });
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(400).json({ title: "cannot update", message: err.message });
    }
};

// כניסה 

export async function getUserByUsernamePassword_Login(req, res) {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({ title: "Missing fields", message: "Username and password are required" });
        }

        // חיפוש המשתמש במסד הנתונים
        let user = await userModel.findOne({ userName }).lean();
        if (!user) {
            return res.status(404).json({ title: "User not found", message: "No user found with this username" });
        }

        // בדיקת התאמת הסיסמה עם bcrypt
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ title: "Incorrect password", message: "Wrong password" });
        }

        // יצירת טוקן
        let token = generateToken({ id: user._id, userName: user.userName, role: "USER" });

        // הסרת הסיסמה מהנתונים שנשלחים ללקוח
        const { password: _, ...userData } = user;
        userData.token = token;

        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ title: "Server error", message: err.message });
    }
}

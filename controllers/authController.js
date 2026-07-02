const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const responseUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
};

res.status(201).json({
    message: "User created successfully",
    user: responseUser,
});

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

const login = async (req, res) => {
     try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success:false,
                message:"Please fill all fields"
            });
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({
                success:false,
                message:"User does not exist"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Invalid Credentials"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id:user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );

        // Store JWT in Cookie
       res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

        return res.status(200).json({
            success:true,
            message:"Login Successful",
        });

    }
    catch(error){

        console.log(error);

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });

    }
};

const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const logout = (req, res) => {

    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });

};

const uploadResumeToPool = async (req, res) => {
    try {
        const { title } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please attach a valid file" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User session expired" });
        }

        // Push new file parameters directly into the user's subdocument array bucket
        user.resumes.push({
            title: title || `Resume-${user.resumes.length + 1}`,
            filePath: req.file.path
        });

        await user.save();
        return res.status(200).json({ success: true, message: "Resume added to your profile bank", resumes: user.resumes });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getResumePool = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("resumes");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, resumes: user.resumes });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteResumeFromPool = async (req, res) => {
    try {
        const { resumeId } = req.params;

        // $pull atomically removes an object from an array matching a specific criteria
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { resumes: { _id: resumeId } } },
            { new: true }
        ).select("resumes");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Resume removed from your repository pool", 
            resumes: user.resumes 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};



module.exports = {
  signup,login,getProfile,logout,uploadResumeToPool, getResumePool,deleteResumeFromPool
};

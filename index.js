const {initializeDatabase} = require('./db/db.connect')
const User = require('./models/users.models')
const Post = require('./models/posts.models')
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const cloudinary = require('cloudinary')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken')

dotenv.config()

const SECRET_KEY = 'echo_login_access_key'

const app = express()
const PORT = 8010

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(bodyParser.json())


initializeDatabase()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const storage = multer.diskStorage({})
const upload = multer({ storage })



app.listen(PORT, () => {
  console.log("Server is running on port", PORT)
})


// const uploadManyUsers = async () => {
//   try {
//     const options = {ordered: true}
//     const result = await User.insertMany(users, options)

//     console.log(`${result.insertedCount} documents were inserted.`)
//   } catch (error) {
//     console.log(error)
//   }
// }

// uploadManyUsers()

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().populate({path: "bookmarks", populate: {path: "author"}})
    if (users.length > 0) {
      res.send(users)
    } else {
      res.status(404).json("Users not found.")
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Internal server error."})
  }
})


//update user
app.post("/api/users/edit/:userId", async (req, res) => {
  console.log(req.body)
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true}).populate({path: "bookmarks", populate: {path: "author"}})
    if(updatedUser) {
      res.status(201).json({message: "user updated successfully", updatedUser})
    } else {
      res.status(404).json("Failed to update user.")
    } 
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Internal server error."})
  }
})

app.post("/api/users/updateUser/:userId", upload.single("profilePictureUrl"), async (req, res) => {
  try {
    const file = req.file
    const user = await User.findById(req.params.userId)

    let updatedUser

    if(user.profilePictureUrl == req.body.profilePictureUrl) {
      updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true}).populate({path: "bookmarks", populate: {path: "author"}})
    } else {
      if(!file) {
        updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true}).populate({path: "bookmarks", populate: {path: "author"}})
      } else {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "uploads"
      })
        updatedUser = await User.findByIdAndUpdate(req.params.userId, {...req.body, profilePictureUrl: result.secure_url}, {new: true}).populate({path: "bookmarks", populate: {path: "author"}})
      }
      
    }

    if(updatedUser) {
      res.status(201).json({message: "user updated successfully", updatedUser})
    } else {
      res.status(404).json("Failed to update user.")
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Internal server error."})
  }
})




//update post
app.post("/api/posts/edit/:postId", async (req, res) => {
  console.log(req.body)
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.postId, req.body, {new: true}).populate([{path: "author"}])
    if(updatedPost.length != 0) {
      console.log(updatedPost)
      res.status(201).json({message: "post updated successfully", post: updatedPost})
    } else {
      res.status(404).json("Internal server error.")
    }


  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Failed to update post"})
  }
})

// app.post("/api/posts/:postId/comment", async (req, res) => {
//   try {
//     const {parentComment} = req.body

//     const newComment = new Comment(req.body)
//     const savedComment = await newComment.save()


//     const post = await Post.findById(req.params.postId)
//     post.comments = [...post.comments, req.body]
//     await post.save()

//     res.status(201).json({message: "Comment added successfully", post: post})
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({message: "Internal server error."})
//   }
// })

// app.post("/api/comment/:commentId/reply", async (req, res) => {
//   try {
//     const newComment = new Comment(req.body)
//     const savedComment = await newComment.save()



//   } catch (error) {
//     console.log(error)
//     res.status(500).json({message: "Internal server error."})
//   }
// })



// app.post("/api/users", async (req, res) => {
//   try {
//     const newUser = new User(req.body)
//     const savedUser = await newUser.save()
//     res.status(201).json({message: "user added successfully.", post: savedUser})
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({message: "Failed to add user.", error: error})
//   }
// })

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate([{path: "author"}, {path: "repost", populate: {path: "author"}}])
    if(posts.length > 0) {
      res.send(posts)
    } else {
      res.status(404).json({message: "Internal server error."})
    }
  } catch (error) {
    console.log(error)
  }
})

// app.post("/upload", upload.single("image"), async (req, res) => {
//     try {
//         const file = req.file
//         if(!file) return res.status(400).send("No file uploaded.")
        
//         const result = await cloudinary.uploader.upload(file.path, {
//             folder: "uploads"
//         })

//         const newImage = new Post({author, media, content})
//         await newImage.save()
        
//     } catch (error) {

//     }
// })



app.post("/api/user/post", upload.single("media"), async (req, res) => {
  console.log(req.body)
  try {
    const file = req.file
    const {author, content, repost, parentPostComment} = req.body

    let newPost

    if(!file) {
        newPost = new Post({author, content, repost, parentPostComment})
    } else {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "uploads"
        })
        newPost = new Post({author,content,repost,parentPostComment, media: result.secure_url})
    }

    const savedPost = await newPost.save()

    if(parentPostComment) {
      res.status(201).json({message: "comment added successfully.", post: savedPost})
    } else {
      res.status(201).json({message: "post added successfully.", post: savedPost})
    }
    
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Failed to add post.", error: error})
  }
})

app.post('/login', async (req, res) => {

  const {email, password, rememberMe} = req.body


  const user = await User.findOne({email})

  if (!user) {
      return res.status(400).json({ message: "Account Doesn't exists" });
  }


  const isMatch = user.password === password
  if (!isMatch) {
      return res.status(400).json({ message: 'Wrong Password' });
  }


  const payload = {userId: user._id}

  const tokenOptions = rememberMe ? {expiresIn: '7d'} : {expiresIn: '15m'}

  const token = jwt.sign(payload, SECRET_KEY, tokenOptions)

  return res.status(200).json({ message: 'Login successful', token });
}) 

// app.get("/api/posts/:postId", (req, res) => {
//   try {
//     const requiredPost = Post.findById(req.params.postId)
//     if(requiredPost) {
//       res.send(requiredPost)
//     } else {
//       res.status(404).json({message: "post not found."})
//     }
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({message: "Failed to get post."})
//   }
// })



// app.delete("/api/user/posts/:postId", async (req, res) => {
//   try {
//     const deletedPost = await findByIdAndDelete(req.params.postId)

//     if(deletedPost) {
//       res.status(201).json({message: "Post deleted successfully.", post: deletedPost})
//     } else {
//       res.status(404).json("Internal server error.")
//     }
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({message: "Failed to delete post."})
//   }
// })

const verifyToken = (req, res, next) => {

  const token = req.headers['authorization']?.split(' ')[1]

  console.log(token)

  if (!token) {
      return res.status(401).json({ message: 'No token provided' });
  }

   jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: 'Invalid token' });
      }
      req.userId = decoded.userId
      
      next();
  });
};

app.post("/api/verifyToken", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId)
  return res.status(200).json({message: 'Verification Success.', user})
} )




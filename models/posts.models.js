const mongoose = require("mongoose")

// const commentSchema = mongoose.Schema(
//   {
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     content: {
//       type: String,
//       required: true
//     },
//     likes: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }],
//     media: {
//         type: String,
//         default: null
//     },
//     replies: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Comment'
//     }],
//     parentComment: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Comment',
//       default: null
//     }
//   }
// )

const postSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    media: {
        type: String,
        default: null
    },
    repost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    parentPostComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },{timeStamps: true}
)

const Post = mongoose.model("Post", postSchema)
// const Comment = mongoose.model("Comment", commentSchema)

module.exports = Post
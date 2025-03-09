
const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }],
    about: {
      type: String
    },
    profilePictureUrl: {
      type: String,
      default: () => {
        return `https://placehold.co/600x400?text=${this.userName[0]}`
      }
    }
  },{timeStamps: true}
)

const User = mongoose.model("User", userSchema)

module.exports = User
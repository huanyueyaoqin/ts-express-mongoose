import { Schema, model, Model, Document, DocumentQuery } from "mongoose";
import uuid = require("uuid");
import { NextFunction } from "express";
// import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JwtPayload } from "src/types/Jwt";
// import { PostSchema, IPostDocument } from "./Post";
import { IPostDocument } from "./Post";

enum Role {
  basic = "basic",
  admin = "admin"
}
interface IUserModel extends Model<IUserDocument> {
  admin: () => DocumentQuery<IUserDocument | null, IUserDocument, {}>;
  orderByUsernameDesc: () => DocumentQuery<IUserDocument | null, IUserDocument, {}>;
}

export interface IUserDocument extends Document {
  username: string;
  password: string;
  email: string;
  role: Role;
  // createAt: string;
  // updateAt: string;
  // updateAt: Date;
  _doc: IUserDocument;
  generateToken: () => string;
  // like_posts: IPostDocument[];
  like_posts: IPostDocument["_id"][];
}

const userSchema: Schema<IUserDocument> = new Schema(
  {
    username: {
      type: String,
      required: [true, "必须填写"],
      minlength: [6, "最少6位"]
    },
    password: String,
    email: {
      type: String,
      // validate: {
      //   validator: validator.isEmail
      // }
      trim: true,
      match: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
    },
    role: {
      type: String,
      enum: ["basic", "admin"],
      default: "basic"
    },
    // createAt: String,
    // updateAt: String,
    // createAt: { type: String, default: Date.now() },
    // updateAt: { type: Date, default: Date.now() },
    uuid: {
      type: String,
      default: uuid.v4()
    },
    // like_posts: { type: [PostSchema] }
    like_posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "posts"
      }
    ]
  },
  { timestamps: true }
);

// userSchema.set("timestamps", true);

userSchema.methods.generateToken = function(): string {
  const payload: JwtPayload = { id: this._id };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
    expiresIn: "24h"
  });
};

userSchema.static("admin", () => {
  return User.findOne({ username: "ffff" });
});
userSchema.static("orderByUsernameDesc", () => {
  return User.find({}).sort({ username: -1 });
});

userSchema.pre<IUserDocument>("save", async function save(next: NextFunction) {
  // if (this.isNew) {
  //   this.createAt = new Date().toISOString();
  // }
  // this.updateAt = new Date().toISOString();

  if (!this.isModified("password")) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// const User: Model<IUserDocument> = model<IUserDocument, IUserModel>("User", userSchema);
const User: IUserModel = model<IUserDocument, IUserModel>("User", userSchema);

export default User;

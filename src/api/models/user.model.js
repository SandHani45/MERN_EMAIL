const mongoose = require("mongoose");
const httpStatus = require("http-status");
const { omitBy, isNil } = require("lodash");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");
const jwt = require("jwt-simple");
const APIError = require("../utils/APIError");
const { env, jwtSecret, jwtExpirationInterval } = require("../../config/vars");

/**
 * User Roles
 */
const roles = ["user"];

/**
 * User Schema
 * @private
*/
const userSchema = new mongoose.Schema(
  {
    methods: {
      type: [String],
      required: true
    },
    userId: {
      type: String
    },
    salutation: {
      type: String
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      minlength: 3,
      maxlength: 20
    },
    mobile: {
      type: Number,
      unique: true,
      minlength: 10,
      maxlength: 12
    },
    lastName: {
      type: String,
      minlength: 3,
      maxlength: 16
    },
    firstName: {
      type: String,
      minlength: 3,
      maxlength: 16
    },
    phoneCountry: {
      type: Number
    },
    isVerify: {
      type: Boolean,
      default: false
    },
    Share:{
      facebookRole: {
        id: {
          type: String
        }
      },
      twitterRole: {
        id: {
          type: String
        }
      },
      googleRole: {
        id: {
          type: String
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: "user"
    },
    dateOfBirth: {
      type: Date
    },
    registered: {
      type: Boolean,
      default: false
    },
    interests: {
      type: Array
    },
    LoyaltyPoints: {
      totalAccruedTodate: {
        type: String
      },
      totalRedeemedToDate: {
        type: String
      },
      netAvailable: {
        type: String
      }
    }
  },
  {
    timestamps: true
  }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    const rounds = env === "test" ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;
  
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "id",
      "isVerify",
      "email",
      "role",
      "createdAt",
      "mobile",
      "username",
      "dateOfBirth",
      "interests"
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment()
        .add(jwtExpirationInterval, "minutes")
        .unix(),
      iat: moment().unix(),
      sub: this._id
    };
    return jwt.encode(playload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  }
});

/**
 * Statics
 */
userSchema.statics = {
  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: "User does not exist",
        status: httpStatus.NOT_FOUND
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find email of Facebook or TW or Google plus and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findSocialNetworkAndGenerateToken(options) {
    const { email, methods, facebook, twitter, google } = options;
    if (!email)
      throw new APIError({
        message: "An email is required to generate a token"
      });
    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true
    };
    if(facebook.id || twitter.id ||  google.id){
      return { user, accessToken: user.token() };
    } else{
      err.message = "Invalid Access toke";
    }
    throw new APIError(err);
  },


  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email)
      throw new APIError({
        message: "An email is required to generate a token"
      });

    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true
    };
    if (password) {
      if (user && (await user.passwordMatches(password))) {
        return { user, accessToken: user.token() };
      } else {
        let username = email;
        const emailUser = await this.findOne({ username }).exec();
        if (emailUser && (await emailUser.passwordMatches(password))) {
          return { user: emailUser, accessToken: emailUser.token() };
        }

        err.message = "Incorrect email/username or password";
      }
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = "Invalid refresh token.";
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = "Incorrect email or refreshToken";
    }
    throw new APIError(err);
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ page = 1, perPage = 30, name, email, role }) {
    const options = omitBy({ name, email, role }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return new APIError({
        message: "Validation Error",
        errors: [
          {
            field: "email",
            location: "body",
            messages: ['"email" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("User", userSchema);